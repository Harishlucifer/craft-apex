import { Card, CardContent, CardHeader, CardTitle } from "@craft-apex/ui";
import { useAuthStore } from "@craft-apex/auth";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span>{user?.name ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span>{user?.email ?? "—"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
