import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@craft-apex/ui";

interface Props {
  title: string;
  description?: string;
  /** Path the back button should return to (defaults to /). */
  backTo?: string;
  /** Optional bullet list of what the legacy page contained. */
  legacyNotes?: string[];
}

/**
 * Lightweight placeholder for routes whose pages are pending a proper port.
 * Lets the app navigate end-to-end while we incrementally upgrade screens.
 */
export function RoutePlaceholder({
  title,
  description,
  backTo,
  legacyNotes,
}: Props) {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {backTo && (
          <Button asChild variant="outline" size="sm">
            <Link to={backTo}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <Construction className="h-6 w-6 text-amber-500" />
          <p className="text-sm font-medium">
            This page is not ported yet.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {description ??
            "The legacy screen for this route exists, but the full UI hasn't landed in the new portal yet."}
        </p>

        {legacyNotes && legacyNotes.length > 0 && (
          <div className="space-y-2 rounded-md border border-slate-100 bg-slate-50/40 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Legacy parity notes</p>
            <ul className="list-disc space-y-1 pl-5">
              {legacyNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="font-mono text-[11px] text-slate-400">{pathname}</p>
      </div>
    </div>
  );
}
