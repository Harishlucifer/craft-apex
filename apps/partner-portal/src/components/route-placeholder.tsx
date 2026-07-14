import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@craft-apex/ui";

interface Props {
  title: string;
  description?: string;
  backTo?: string;
  /** What the legacy channel-flexi screen did, so the port has a spec to hit. */
  legacyNotes?: string[];
}

/**
 * Placeholder for routes still pending a port. Lets the app navigate
 * end-to-end while screens land incrementally.
 */
export function RoutePlaceholder({
  title,
  description,
  backTo = "/dashboard",
  legacyNotes,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Construction className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {legacyNotes && legacyNotes.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending port
          </p>
          <ul className="list-disc space-y-1.5 ps-5 text-sm text-slate-600">
            {legacyNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <Button asChild variant="outline">
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>
    </div>
  );
}
