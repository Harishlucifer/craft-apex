# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A from-scratch rewrite of a legacy lending platform's frontend into a Turborepo monorepo (Vite + TS + React 18 + TanStack Query + Zustand + Shadcn). Three portals, one backend:

| App | Port | `X-Platform` | Backend user type | Legacy source |
|---|---|---|---|---|
| `employee-portal` | 3000 | `EMPLOYEE_PORTAL` | `EMPLOYEE` | `craft-frontend` (not on disk) |
| `partner-portal` | 3001 | `PARTNER_PORTAL` | `CHANNEL` | `channel-flexi` (see below) |
| `consumer-portal` | 3002 | `CUSTOMER_PORTAL` | `CUSTOMER` | none — designed fresh |

Employee-portal is far along (~135 pages, ~51 domains). See `docs/PHASES.md` for status and `docs/MIGRATION.md` for the porting recipe — **but read the "Stale docs" section below before trusting either.**

## Commands

```bash
npm install
cp apps/employee-portal/.env.example apps/employee-portal/.env   # set VITE_API_ENDPOINT
npm run dev:employee            # :3000
npm run dev:partner             # :3001
npm run dev:consumer            # :3002

npm run typecheck               # all workspaces
npm run typecheck -w @craft-apex/employee-portal   # single workspace — the fast inner loop
npm run build:employee          # tsc --noEmit && vite build
npm run format                  # prettier
```

**There is no test runner and no ESLint anywhere.** `npm run lint` is an `echo` no-op in every package. `npm run typecheck` is the only automated verification — run it after every change. TypeScript is strict, including `noUncheckedIndexedAccess`.

## Architecture

### Workspace packages are consumed as TypeScript source

Packages have no build step: their `main` points straight at `src/index.ts`, and the app resolves them via Vite aliases (`apps/employee-portal/vite.config.ts`) plus tsconfig `paths`. Editing `packages/*` hot-reloads in the app with no rebuild, and the app's `tsc` typechecks package source alongside its own (`"include": [..., "../../packages/*/src"]`).

Dependency direction: `api` ← `auth`, `layout`; `ui` and `i18n` are leaves. `layout` is the only package that composes all of them.

| Package | Owns |
|---|---|
| `@craft-apex/api` | axios factory, token storage, TanStack Query client, `X-Module` context |
| `@craft-apex/auth` | `useAuthStore` (zustand), `AuthGuard` |
| `@craft-apex/layout` | module tree store, `useModule`, `PermissionGate`, app shell (header/dual-sidebar/breadcrumbs) |
| `@craft-apex/ui` | 14 Shadcn primitives only (button, input, table, dialog, card, …) + `cn` + `toast` |
| `@craft-apex/i18n` | i18next init, `useTranslation`/`Trans` re-exports, `en`/`hi`/`ta`/`ar` resources |
| `@craft-apex/shared` | cross-portal app building blocks: `DataTableShell` (+ table class consts), `useClientList` |

### The backend-driven module system (the central concept)

Routes are **static** in `apps/employee-portal/src/routes.tsx` (537 lines, all eagerly imported, no lazy/Suspense). Everything else — sidebar, breadcrumbs, permissions, the `X-Module` header — is driven by a **module tree the backend returns at login**.

The flow: `login.page.tsx` gets `{ user, module }` → `setSession(user)` + `setModules(module)` → both persist to `localStorage` (legacy-compatible keys in `packages/api/src/storage.ts`) and populate `useAuthStore` / `useModuleStore`. On every navigation, `useModule()` walks the tree depth-first matching the node's `url` against the current pathname (`resolveModule`, path-to-regexp), and publishes the matched node's `map_id` as the `X-Module` request header.

**Consequence: a route's `path` in `routes.tsx` must exactly match the `url` the backend returns for that module**, or the sidebar won't highlight, breadcrumbs break, permissions default-deny, and `X-Module` goes unset.

### API client (`packages/api/src/client.ts`)

Non-obvious behaviors every feature depends on:

- **The response interceptor returns `response.data`**, not the axios response. So calls are typed `api.get<unknown, TBody>(url)` — the *second* type param is the body.
- **json-bigint with `storeAsString`**: loan/account ids exceed 2^53. They are **strings end-to-end** — keep them typed `string`, never `number`.
- **Single-flight 401 → `/auth/refresh` → retry**; on failure clears tokens and calls `onSessionExpired` (hard-redirects to `/login`).
- `X-Platform`, `X-Tenant-Domain`, `X-Module`, and `Authorization` are set centrally in the request interceptor. **Never set them per request.**
- `FormData`/`Blob` bodies pass through untouched so multipart boundaries survive.

Features import the app singleton (`import { api } from "@/lib/api"`), never `@craft-apex/api` directly.

## Feature conventions

Follow the dominant pattern exactly — consistency here is >95% across 438 files.

```
features/<domain>/<screen>/<screen>.page.tsx     # export default function XxxPage()
                           <screen>.api.ts       # TanStack Query hooks
                           <screen>.types.ts     # request/response/row types
```

The file base name repeats the folder name (`role/role-form/role-form.api.ts`). Sub-components of a screen are plain kebab-case (`*-panel.tsx`, `*-modal.tsx`, `*.step.tsx`). Barrel `index.ts` files are **not** a convention (only `workflow-runtime` has one).

**Endpoints are colocated, not centralized.** There is no shared endpoints registry. Each `*.api.ts` declares its paths as module-level consts (`const URL_ROLES = "/alpha/v1/master/user-role"`) and exports `useQuery`/`useMutation` hooks. **Pages never call `api.get` directly.** Only GET and POST are used — the backend does POST-for-upsert (presence of an id in the payload means update).

Response envelopes are inconsistent server-side, so the standard defensive unwrap is:

```ts
const arr = body?.data ?? body?.result ?? body;
return Array.isArray(arr) ? arr : [];
```

When a URL takes query params, the convention is a **local** `function buildUrl(...)` at the top of that `*.api.ts` composing the query string (~17 files do this). This is unrelated to the `buildUrl` exported from `@craft-apex/api`, which does `{{TOKEN}}` templating and has no call sites — don't reach for it.

**List pages** compose app-local components from `@/components` — note these are *not* in `packages/ui`:
- `DataTableShell` (91 pages) — owns card chrome, skeletons, empty state, pagination footer. Each page still writes its own columns/rows inline and must reuse the exported `TABLE_HEADER_ROW_CLASS` / `TABLE_HEAD_CLASS` / `TABLE_ROW_CLASS`.
- `useClientList` (33 pages) — client-side search/paging for legacy endpoints that return the whole array. Server-paginated endpoints instead hold `page` state and read `data.pagination.total`.
- `ReportShell` + `DateRangeFields` + `useReportExport` (17 report pages).
- `components/query-builder/` — recursive AND/OR condition builder used by rule/npa-rule/parameter/scoring-engine forms.

**Form pages** (38, all identical in shape): zod schema declared **inline in the `.page.tsx`** (no `.schema.ts` files anywhere) + `zodResolver` + create-vs-edit keyed off `useParams().id` + `useMemo` defaults from the detail query + `useEffect(() => reset(defaults), [defaults, reset])` when the async detail lands + camelCase form values mapped to a snake_case payload + `toast` + `navigate`. There is **no Select component in `packages/ui`** — forms use a raw `<select>` with a locally-defined `selectClass`.

**Permissions**: gate action UI with `<PermissionGate action="add|edit|view|delete|export">` (24 files); use `useModule()` when you need the boolean in logic (19 files):

```tsx
const module = useModule();
const canEdit = Boolean(module?.node.allowed_permission?.edit);
```

Both default-deny when no module resolves. `RouteGuard` is defined in `packages/layout/src/permission-gate.tsx` but has **zero call sites** — routes carry no per-route permission guard; `routes.tsx` wraps everything in a single `<AuthGuard><AppLayout /></AuthGuard>`.

**i18n** is partially adopted (22 of ~135 pages — mostly list/queue pages, login, dashboard; form pages are hardcoded English). Import `useTranslation` from `@craft-apex/i18n`, never `react-i18next`. Namespaces: `common`, `settings`, `application`, `dashboard`, `lead`, `login`, `menu`, `layout`, `pages`. Keys are dot-namespaced by screen (`loginQ.colLeadId`).

## Hard rules

- **Never guess an endpoint, query param, request field, or response field.** The project's stated rule is that every one is read verbatim from the source of truth. Since the legacy frontend is not on disk (below), the backend is that source: `../alpha-api` is the Go/Fiber server for these `/alpha/v1/*` routes — `app/routes/v1.go` is the authoritative endpoint list, and it has its own CLAUDE.md.
- Never read tokens or the module tree from `localStorage` in a feature — go through `useAuthStore` / `useModuleStore`.
- Big numeric ids stay `string`.
- Cross-portal components graduate into **`packages/shared`**, not `packages/ui`. (`ui` must stay a leaf: `i18n` already depends on `ui` for its language switcher, so anything calling `useTranslation` — `DataTableShell` does — would make `ui → i18n → ui` a cycle. `shared` sits above both.) Pure primitives with no i18n dependency still belong in `ui`. Portal-specific screens stay in the app's own `features/`.
- Unported routes render `<RoutePlaceholder>` rather than 404. See `docs/PHASES.md` (employee) and the placeholders in `apps/partner-portal/src/routes.tsx`.

## The three portals

**Partner is a clone of employee; consumer is not.** This is the fork that matters:

- **Partner** (`PARTNER_PORTAL` → `CHANNEL`) uses the *identical* architecture. `login-with-password` / `login-with-otp` return the same `{ user, module, privilege, tenant }` envelope, and `FetchModuleHierarchy(roleID, platform, &partnerCategory)` returns a platform-scoped module tree. So it reuses `@craft-apex/{api,auth,layout,ui,i18n,shared}` verbatim — same sidebar, same `PermissionGate`, same `X-Module` flow, same "route path must match the backend module `url`" rule.

- **Consumer** (`CUSTOMER_PORTAL` → `CUSTOMER`) **has no roles and no module tree.** alpha-api skips the role lookup entirely for `UserTypeCustomer` (`services/auth/auth.go:106`), and `FetchModuleHierarchy` is only called on the channel/employee branches. Therefore consumer-portal **does not depend on `@craft-apex/layout` at all** — it has its own `ConsumerLayout` with hand-written nav, and there is no `useModule`, no `PermissionGate`, no `X-Module` header. Do not "fix" this by adding the layout package.
  - Customers are keyed by **mobile, not email** (`user.FindByMobile`), have no password, and are auto-created by `CreateUpdateCustomer(name, mobile)`. OTP (`/auth/login-with-otp`) is the only login.
  - The backend **auto-scopes** list endpoints to the signed-in customer (`services/db/application.go:113` filters applications to those where the customer is an `application_participant`). So consumer screens call the *same* endpoints as employee-portal and get only that customer's rows — never invent customer-specific endpoints or pass a customer-id filter.

Partner login also encodes onboarding state in the login *status code* rather than a separate endpoint (`-100` incomplete → resume `/register/:channelId`, `-101` pending ask / awaiting approval, `-102` rejected). Those are routing outcomes, not errors — see `apps/partner-portal/src/features/auth/login/login.api.ts`.

## Stale docs — do not follow blindly

`docs/MIGRATION.md`'s "Migrating a module" steps predate the current codebase and are wrong on five counts:

1. `packages/api/src/endpoints.ts` **does not exist** — there is no shared endpoint registry, and the `{{TOKEN}}` templating it describes is unused.
2. Naming is `<screen>.api.ts` / `<screen>.page.tsx`, not `<module>-api.ts` / `<module>-list.tsx`.
3. There is **no `DataTable` in `packages/ui`** — use `@/components/data-table-shell`.
4. Routes have no `validateModule` flag.
5. The legacy `craft-frontend` (employee) repo it tells you to port from is **not checked out** on this machine. Existing `*.api.ts` files carry comments citing the legacy file and endpoint they replaced — those comments plus `../alpha-api` are the practical references.

The legacy **partner** portal, however, *is* on disk: `/Users/fingrid (Deleted)/Vibing/channel-flexi` (CRA + redux + Velzon). Its endpoint registry is `src/Components/helper/ApiEndPoint.js` and its route table is `src/Routes/allRoutes.js`. Port partner screens from there.

The rest of MIGRATION.md ("Rules") and PHASES.md's status tracking are accurate.
