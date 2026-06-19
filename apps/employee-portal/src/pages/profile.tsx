import { Card, CardContent, CardHeader, CardTitle } from "@craft-apex/ui";
import { useAuthStore } from "@craft-apex/auth";
import { useTranslation } from "@craft-apex/i18n";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation("pages");
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{t("profile.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("profile.name")}</span>
          <span>{user?.name ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("profile.email")}</span>
          <span>{user?.email ?? "—"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
