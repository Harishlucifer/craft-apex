import { Globe, Check } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@craft-apex/ui";
import { useLanguage } from "../use-language";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  /** Visual variant. `compact` is icon-only — for headers/login. */
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageSwitcher({
  variant = "compact",
  className,
}: LanguageSwitcherProps) {
  const { language, setLanguage, languages } = useLanguage();
  const { t } = useTranslation("common");
  const active = languages.find((l) => l.code === language) ?? languages[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 gap-2 text-slate-600 hover:text-slate-900",
            className
          )}
          aria-label={t("language")}
        >
          <Globe className="h-4 w-4" />
          {variant === "full" ? (
            <span className="text-sm font-medium">{active.nativeLabel}</span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide">
              {active.code}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className="flex items-center justify-between"
          >
            <span>{l.nativeLabel}</span>
            {l.code === language ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
