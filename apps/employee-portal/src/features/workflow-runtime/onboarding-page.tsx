import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@craft-apex/ui";
import { WorkflowRuntime } from "./workflow-runtime";

interface Props {
  title: string;
  workflowType: string;
  /** List page to return to when the user closes the runtime. */
  listPath: string;
  /** Optional pre-filter for the journey picker. */
  partnerType?: string;
}

/**
 * Generic onboarding page that mounts the WorkflowRuntime for a given
 * workflow type. Used by partner / BC / vendor / APF onboarding routes.
 */
export function OnboardingPage({
  title,
  workflowType,
  listPath,
  partnerType,
}: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  // Legacy supports ?partner_type=… as a URL override.
  const effectivePartnerType =
    searchParams.get("partner_type") ?? partnerType ?? undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to={listPath}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <WorkflowRuntime
        workflowType={workflowType}
        sourceId={id}
        partnerType={effectivePartnerType}
        title={`${title} workflow`}
        onClose={() => navigate(listPath)}
      />
    </div>
  );
}
