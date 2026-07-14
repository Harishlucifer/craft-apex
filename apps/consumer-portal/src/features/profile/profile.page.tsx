import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@craft-apex/ui";
import { useUserInfo } from "./profile.api";

/**
 * "Profile" — read-only. Customers can't self-edit their KYC'd details, so
 * there is no form here; changes go through the branch/relationship team.
 */
export default function ProfilePage() {
  const { data, isPending, isError } = useUserInfo();

  // The session user is a usable fallback: it's the same payload the OTP login
  // stored, so the screen still renders if /user/info is briefly unavailable.
  const sessionUser = useAuthStore((s) => s.user);

  const name = data?.username ?? sessionUser?.name;
  const mobile = data?.mobile ?? sessionUser?.mobile;
  const email = data?.email ?? sessionUser?.email;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          The details we hold for you.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your details</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && !sessionUser ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-56" />
            </div>
          ) : (
            <>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Name" value={name} />
                <Field label="Mobile" value={mobile} />
                <Field label="Email" value={email} />
              </dl>

              {isError && (
                <p className="mt-5 text-xs text-slate-400">
                  Showing your saved details — we couldn't refresh them just now.
                </p>
              )}

              <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500">
                Need something changed? Contact us and we'll update it for you.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium text-slate-900">Sign out</p>
            <p className="text-sm text-slate-500">
              You'll need your mobile number to sign back in.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">
        {value ? value : <span className="text-slate-400">Not on record</span>}
      </dd>
    </div>
  );
}
