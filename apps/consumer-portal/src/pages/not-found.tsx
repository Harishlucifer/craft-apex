import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@craft-apex/ui";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p className="text-5xl font-semibold tracking-tight text-slate-900">404</p>
      <p className="text-sm text-slate-500">That page doesn&apos;t exist.</p>
      <Button asChild variant="outline">
        <Link to="/applications">
          <ArrowLeft className="h-4 w-4" /> Back to my applications
        </Link>
      </Button>
    </div>
  );
}
