import { Link } from "react-router-dom";
import { Button } from "@craft-apex/ui";
import { useTranslation } from "@craft-apex/i18n";

export default function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-4xl font-bold">{t("notFound.code")}</p>
      <p className="text-muted-foreground">{t("notFound.description")}</p>
      <Button asChild>
        <Link to="/dashboard">{t("notFound.backToDashboard")}</Link>
      </Button>
    </div>
  );
}
