# craft-apex

From-scratch rewrite of the legacy lending portals as a Turborepo monorepo.

**Stack:** TypeScript · Vite · React 18 · React Router 6 · Shadcn/UI · Tailwind · Zustand · TanStack Query · Turborepo

## Layout

```
apps/
  employee-portal/      # :3000  X-Platform EMPLOYEE_PORTAL  (back-office)
  partner-portal/       # :3001  X-Platform PARTNER_PORTAL   (channel partners / DSA)
  consumer-portal/      # :3002  X-Platform CUSTOMER_PORTAL  (borrower self-service)
packages/
  typescript-config/    # shared tsconfig presets
  tailwind-config/      # shared Tailwind preset
  ui/                   # Shadcn-based component library (replaces the old git submodule)
  api/                  # axios client (401-refresh, json-bigint, tenant headers) + react-query
  auth/                 # session store + route guard
  layout/               # dynamic module system + app shell (sidebar/header)
  i18n/                 # i18next setup + en/hi/ta/ar resources
  shared/               # cross-portal building blocks (DataTableShell, useClientList)
```

Employee and partner portals share the backend-driven module system (sidebar, permissions
and the `X-Module` header all come from the module tree returned at login). The consumer
portal does **not** — customers have no role and no module tree, so it uses its own shell
and OTP-by-mobile login.

## Develop

```bash
npm install
cp apps/employee-portal/.env.example apps/employee-portal/.env   # set VITE_API_ENDPOINT
npm run dev:employee      # or dev:partner / dev:consumer
```

## Migration status

Backbone (auth, API, dynamic module/route system, layout) + login/dashboard/Lead-list
slice are in place. Remaining ~250 legacy routes are migrated module-by-module — see
`docs/MIGRATION.md`.
