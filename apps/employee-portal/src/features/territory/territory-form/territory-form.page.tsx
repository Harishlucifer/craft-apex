import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import { useSaveTerritory, useTerritoryDetail } from "./territory-form.api";
import type {
  BoundaryCoordinate,
  TerritorySavePayload,
} from "./territory-form.types";
import {
  buildNestedFormPayload,
  buildWorkflow,
  UiComponentLoader,
  WorkflowType,
  type FormBuilderStepContext,
  type WorkflowStepDef,
} from "@craft-apex/workflow-runtime";

export default function TerritoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["territory-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({
        workflowType: WorkflowType.TerritoryManagement,
        sourceId: id,
      }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  // Single-step form — no stepper needed, just render whatever the
  // configured workflow's one step is.
  const activeStepDef = steps[0];

  const { data: detail } = useTerritoryDetail(id);
  const save = useSaveTerritory();

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // TerritorySavePayload's JSON structure (dotted paths for the two nested
  // objects — see buildNestedFormPayload below). `show_office`/
  // `show_boundary` are UI-only toggles (not part of the payload) that
  // gate the office/boundary fields via conditionalOn; `...pincodes` and
  // `...coordinates` are raw text/JSON, transformed at submit time below
  // since their shape (comma-list → array, flexible lat/lng JSON) isn't
  // expressible as a straight field-name-to-path mapping.
  useEffect(() => {
    setFormValues({
      code: detail?.code ?? "",
      name: detail?.name ?? detail?.territory_name ?? "",
      description: detail?.description ?? "",
      territory_type_id:
        detail?.territory_type_id != null
          ? String(detail.territory_type_id)
          : "",
      parent_territory_id:
        detail?.parent_territory_id != null
          ? String(detail.parent_territory_id)
          : "",
      location_type: detail?.location_type ?? "",
      location_type_value:
        detail?.location_type_value != null
          ? String(detail.location_type_value)
          : "",
      status: detail?.status != null ? Number(detail.status) : 1,
      show_office: Boolean(detail?.office_detail),
      "office_detail.name": detail?.office_detail?.name ?? "",
      "office_detail.email": detail?.office_detail?.email ?? "",
      "office_detail.contact_detail":
        detail?.office_detail?.contact_detail ?? "",
      "office_detail.pincode": detail?.office_detail?.pincode ?? "",
      "office_detail.latitude":
        detail?.office_detail?.latitude != null
          ? String(detail.office_detail.latitude)
          : "",
      "office_detail.longitude":
        detail?.office_detail?.longitude != null
          ? String(detail.office_detail.longitude)
          : "",
      "office_detail.area_id":
        detail?.office_detail?.area_id != null
          ? String(detail.office_detail.area_id)
          : "",
      "office_detail.address": detail?.office_detail?.address ?? "",
      show_boundary: Boolean(detail?.territory_boundary),
      "territory_boundary.type": detail?.territory_boundary?.type ?? "",
      "territory_boundary.distance":
        detail?.territory_boundary?.distance != null
          ? String(detail.territory_boundary.distance)
          : "0",
      "territory_boundary.latitude":
        detail?.territory_boundary?.latitude != null
          ? String(detail.territory_boundary.latitude)
          : "0",
      "territory_boundary.longitude":
        detail?.territory_boundary?.longitude != null
          ? String(detail.territory_boundary.longitude)
          : "0",
      "territory_boundary.pincodes": Array.isArray(
        detail?.territory_boundary?.pincodes
      )
        ? detail!.territory_boundary!.pincodes!.join(", ")
        : "",
      "territory_boundary.coordinates": detail?.territory_boundary
        ?.coordinates
        ? JSON.stringify(detail.territory_boundary.coordinates, null, 2)
        : "[]",
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const {
      show_office,
      show_boundary,
      "territory_boundary.pincodes": rawPincodes,
      "territory_boundary.coordinates": rawCoordinates,
      ...rest
    } = formValues;

    let coordinates: BoundaryCoordinate[] = [];
    if (
      show_boundary &&
      typeof rawCoordinates === "string" &&
      rawCoordinates.trim()
    ) {
      try {
        const parsed = JSON.parse(rawCoordinates);
        coordinates = Array.isArray(parsed)
          ? parsed.map((c: any) =>
              c && typeof c === "object"
                ? c.lat != null && c.lng != null
                  ? { latitude: Number(c.lat), longitude: Number(c.lng) }
                  : {
                      latitude: Number(c.latitude),
                      longitude: Number(c.longitude),
                    }
                : c
            )
          : [];
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Invalid boundary coordinates JSON"
        );
        return;
      }
    }

    const nested = buildNestedFormPayload(rest) as Partial<TerritorySavePayload> & {
      office_detail?: Record<string, any>;
      territory_boundary?: Record<string, any>;
    };

    const payload: TerritorySavePayload = {
      ...nested,
      code: String(nested.code ?? "").toUpperCase(),
      territory_type_id: String(nested.territory_type_id ?? ""),
      territory_name: String(nested.name ?? ""),
      name: String(nested.name ?? ""),
      status: Number(nested.status ?? 1),
      ...(id ? { territory_id: id } : {}),
      office_detail: show_office
        ? {
            ...(detail?.office_detail?.id
              ? { id: detail.office_detail.id }
              : {}),
            name: nested.office_detail?.name || undefined,
            address: nested.office_detail?.address || undefined,
            contact_detail: nested.office_detail?.contact_detail || undefined,
            email: nested.office_detail?.email || undefined,
            pincode: nested.office_detail?.pincode || undefined,
            latitude: nested.office_detail?.latitude
              ? Number(nested.office_detail.latitude)
              : undefined,
            longitude: nested.office_detail?.longitude
              ? Number(nested.office_detail.longitude)
              : undefined,
            area_id: nested.office_detail?.area_id || undefined,
            status: Number(nested.status ?? 1),
          }
        : undefined,
      territory_boundary:
        show_boundary && nested.territory_boundary?.type
          ? {
              ...(detail?.territory_boundary?.id
                ? { id: detail.territory_boundary.id }
                : {}),
              type: nested.territory_boundary.type,
              status: 1,
              ...(nested.territory_boundary.type === "RADIUS"
                ? {
                    latitude: Number(nested.territory_boundary.latitude),
                    longitude: Number(nested.territory_boundary.longitude),
                    distance: Number(nested.territory_boundary.distance),
                  }
                : {}),
              pincodes:
                typeof rawPincodes === "string"
                  ? rawPincodes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
              coordinates,
            }
          : undefined,
    };

    try {
      await save.mutateAsync(payload);
      toast.success(id ? "Updated successfully!" : "Created successfully!");
      navigate("/settings/territory-management");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const stepContext: FormBuilderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: save.isPending,
    submitLabel: id ? "Save" : "Create",
    cancelHref: "/settings/territory-management",
    lockField: "code",
    lockWhen: id,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Territory" : "Add Territory"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/territory-management">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading form…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for territory management yet. Configure a
          workflow with workflow_type &quot;
          {WorkflowType.TerritoryManagement}&quot; at{" "}
          <Link to="/settings/workflow" className="underline">
            Settings → Workflow
          </Link>
          .
        </div>
      ) : (
        <UiComponentLoader
          step={activeStepDef}
          value={formValues}
          onChange={setFormValues}
          onNext={() => {}}
          onBack={() => {}}
          context={stepContext}
        />
      )}
    </div>
  );
}
