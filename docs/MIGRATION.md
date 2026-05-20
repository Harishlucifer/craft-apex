# Migration Playbook

How the legacy `craft-frontend` (employee portal) is being rewritten into this
monorepo. Follow this pattern for every remaining module so the codebase stays
consistent.

## What's done (the backbone)

| Concern | Legacy | Now |
|---|---|---|
| Bundler / lang | CRA + JS | Vite + TypeScript |
| Server state | redux-saga slices | `@tanstack/react-query` |
| Client/UI state | redux-toolkit | `zustand` |
| Components | MUI + Bootstrap + git submodule | `@craft-apex/ui` (Shadcn) |
| Forms | Formik + Yup | `react-hook-form` + `zod` |
| HTTP | `helpers/api_helper.js` | `@craft-apex/api` (axios + 401-refresh + json-bigint + tenant headers) |
| Auth/session | `useProfile` + localStorage | `@craft-apex/auth` (`useAuthStore`, `AuthGuard`) |
| Dynamic modules | `withModule` HOC + `allRoutes.js` | `@craft-apex/layout` (`useModule`, `resolveModule`, route registry) |

Reference slice already migrated end-to-end: **login → dashboard → Lead list**
(`apps/employee-portal/src/features/lead`).

## Migrating a module (repeatable steps)

1. **Pick a legacy screen** from `craft-frontend/src/pages/<Module>` or
   `craft-frontend/src/Components/<Module>` (the old submodule).
2. **Add endpoints** to `packages/api/src/endpoints.ts` under a domain key,
   using `{{TOKEN}}` for path params (fill with `buildUrl`).
3. **Create the feature folder** `apps/employee-portal/src/features/<module>/`:
   - `<module>-api.ts` — TanStack Query hooks (`useQuery`/`useMutation`)
     calling `api.get/post/...`. Replace redux-saga effects here.
   - `<module>-list.tsx` / `<module>-form.tsx` — UI from `@craft-apex/ui`.
     Use `react-hook-form` + `zod` for forms, `DataTable` for grids.
4. **Register the route** in `apps/employee-portal/src/routes.tsx`. Set
   `validateModule: true` and make `path` exactly match the `url` the backend
   returns in the module tree (so the sidebar + `useModule()` resolve it).
5. **Permissions**: gate actions with
   `module?.node.allowed_permission?.<action>` via `useModule()` — do not
   re-implement the legacy `getModuleObj` traversal.
6. **Typecheck**: `npm run typecheck -w @craft-apex/employee-portal`.

## Rules

- Never read tokens/modules from `localStorage` directly in features — go
  through `useAuthStore` / `useModuleStore`.
- Big numeric ids (loan/account ids) are strings end-to-end — json-bigint
  already returns them as strings; keep them as `string`.
- Shared, cross-portal components graduate into `packages/ui`; portal-specific
  ones stay in the app's `features/`.
- Keep `X-Platform` / `X-Tenant-Domain` / `X-Module` semantics — they're
  handled centrally in `@craft-apex/api`; don't set them per request.

## Remaining scope

~250 legacy routes in `craft-frontend/src/Routes/WithModuleRoutes.js` across
~44 modules (LOS, LMS, Workflow, Collections, Accounting, Channel, Verification,
PayableReceivable, Reports, …). Migrate module-by-module; channel portal
(`channel-flexi`) follows after employee portal as a second `apps/*` consuming
the same packages.
