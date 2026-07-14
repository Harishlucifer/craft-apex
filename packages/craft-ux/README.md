# @craft-apex/craft-ux

Vendored from `git@bitbucket.org:sreedhar_ramasamy/craft-ux-web.git` at commit
`c8a544b` ("Handled the date picker issue"), craft-ux npm v1.0.37.

One-time source vendor, not a submodule/subtree — there is no ongoing git
link back to the upstream repo. To pull a future upstream change: diff that
repo's `src/` against this package's `src/` (structurally identical
file-for-file) and port manually; update `dependencies` here if upstream's
package.json changed; then `npm install` at repo root + typecheck.

## Notes

- `react-router-dom` was dropped (unused upstream, and would clash with the
  apps' react-router-dom v6).
- `Provider` wraps a self-contained Redux store for form state only — it
  does not interact with the app's zustand stores.
- Wire `AxiosProvider`'s `axiosInstance` prop to the app's own
  `@craft-apex/api` client so API-driven fields (`Field.source.api`) share
  tenant/auth headers and 401-refresh with the rest of the app.
- `date-fns` here is `^4.1.0` vs `packages/ui`'s `^3.6.0` — both coexist via
  nested resolution; align later if it becomes annoying, not a blocker now.
