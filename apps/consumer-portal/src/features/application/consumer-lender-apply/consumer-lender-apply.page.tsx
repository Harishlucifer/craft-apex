import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@craft-apex/ui";
import { WorkflowRuntime } from "@craft-apex/workflow-runtime";

export default function ConsumerLenderApply() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  // Legacy supports ?partner_type=... if needed, or lenderCode
  const partnerType = searchParams.get("partner_type") ?? undefined;

  return (
    <div className="w-full space-y-5 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Consumer Lender Application
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/applications">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
        </Button>
      </div>

      <WorkflowRuntime
        workflowType="LENDER_APPLY"
        sourceId={id}
        partnerType={partnerType}
        title="Lender Apply"
        onClose={() => navigate("/applications")}
      />
    </div>
  );
}

