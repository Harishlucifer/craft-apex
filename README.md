# craft-apex

From-scratch rewrite of the legacy lending portals as a Turborepo monorepo.

**Stack:** TypeScript · Vite · React 18 · React Router 6 · Shadcn/UI · Tailwind · Zustand · TanStack Query · Turborepo

## Layout

```
apps/
  employee-portal/      # SPA (Vite) — first portal being migrated
packages/
  typescript-config/    # shared tsconfig presets
  tailwind-config/      # shared Tailwind preset
  ui/                   # Shadcn-based component library (replaces the old git submodule)
  api/                  # axios client (401-refresh, json-bigint, tenant headers) + react-query
  auth/                 # session store + route guard
  layout/               # dynamic module system + app shell (sidebar/header)
```

## Develop

```bash
npm install
cp apps/employee-portal/.env.example apps/employee-portal/.env   # set VITE_API_ENDPOINT
npm run dev:employee
```

## Migration status

Backbone (auth, API, dynamic module/route system, layout) + login/dashboard/Lead-list
slice are in place. Remaining ~250 legacy routes are migrated module-by-module — see
`docs/MIGRATION.md`.
