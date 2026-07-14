// GET /alpha/v1/user/info -> { status, data: AuthResponse }
//
// Backend: app/routes/v1.go:131 `userRoute.Get("/info", userController.UserInfo)`.
// Handler: app/controllers/v1/user/controller.go:1470, which builds a
// `userHandler.AuthResponse` (app/handler/user/user.go:99) and returns it under
// the `data` key (controller.go:1607).
//
// `userRoute` hangs off `protectedV1`, which is
// `RequireLoggedIn() + RequireModuleAccess()` (v1.go:89). That is fine for
// customers: RequireModuleAccess short-circuits when the `X-Module` header is
// absent (app/middlewares/auth.go:119 — the whole check is gated on
// `moduleCodeId != ""`), and this app never sets X-Module because there is no
// module tree. See src/lib/api.ts.
//
// For a CUSTOMER the response is sparse — most AuthResponse fields are
// employee/channel-only (employee_code, designation, office, attendance…) and
// are `omitempty`. We only read the three that are always populated for a
// customer: username, mobile, email.

export interface UserInfo {
  id?: string | number;
  username?: string;
  mobile?: string;
  email?: string;
  user_type?: string;
}
