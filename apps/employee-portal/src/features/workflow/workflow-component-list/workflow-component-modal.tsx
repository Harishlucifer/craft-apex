import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  toast,
} from "@craft-apex/ui";
import { FormBuilderRenderer, type FormDefinition } from "@craft-apex/workflow-runtime";
import {
  useSaveWorkflowComponent,
  type SaveWorkflowComponentPayload,
} from "./workflow-component-list.api";
import type { WorkflowComponentRow } from "./workflow-component-list.types";

const schema: FormDefinition = {
  title: "",
  fields: [
    {
      name: "code",
      label: "Code",
      placeholder: "Please enter workflow code",
      fieldType: "text",
      validation: { required: true },
    },
    {
      name: "name",
      label: "Name",
      placeholder: "Please enter name",
      fieldType: "text",
      validation: { required: true },
    },
    {
      name: "workflow_type",
      label: "Workflow Type",
      placeholder: "Select...",
      fieldType: "dropdown",
      source: {
        api: "/alpha/v1/lookup?group_code=WORKFLOW_TYPE",
        labelKey: "lu_name",
        valueKey: "lu_key",
      },
      validation: { required: true },
    },
    {
      name: "workflow_step_type",
      label: "Step Type",
      placeholder: "Select...",
      fieldType: "dropdown",
      options: [
        { label: "Manual", value: "MANUAL" },
        { label: "Automatic", value: "AUTOMATIC" },
        { label: "Conditional", value: "CONDITIONAL" },
      ],
      validation: { required: true },
    },
    {
      name: "status",
      label: "Status",
      fieldType: "radio",
      defaultValue: 1,
      options: [
        { label: "Active", value: 1 },
        { label: "Inactive", value: 0 },
      ],
      validation: { required: true },
    },
  ],
};


interface Props {
  open: boolean;
  initial: WorkflowComponentRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkflowComponentModal({
  open,
  initial,
  onClose,
  onSuccess,
}: Props) {
  const [values, setValues] = useState<Record<string, any>>({});
  const save = useSaveWorkflowComponent();

  useEffect(() => {
    if (open) {
      if (initial) {
        setValues({
          code: initial.code ?? "",
          name: initial.name ?? "",
          workflow_type: initial.workflow_type ?? "",
          workflow_step_type: initial.workflow_step_type ?? "",
          status: initial.status ?? 1,
        });
      } else {
        setValues({
          code: "",
          name: "",
          workflow_type: "",
          workflow_step_type: "",
          status: 1,
        });
      }
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.code?.trim()) {
      toast.error("Please enter workflow code");
      return;
    }
    if (!values.name?.trim()) {
      toast.error("Please enter name");
      return;
    }
    if (!values.workflow_type) {
      toast.error("Please select workflow type");
      return;
    }
    if (!values.workflow_step_type) {
      toast.error("Please select step type");
      return;
    }

    const payload: SaveWorkflowComponentPayload = {
      ...(initial?.id ? { id: String(initial.id) } : {}),
      code: values.code.trim(),
      name: values.name.trim(),
      workflow_type: values.workflow_type,
      workflow_step_type: values.workflow_step_type,
      status: Number(values.status ?? 1),
    };

    save.mutate(payload, {
      onSuccess: (res) => {
        if (res?.status === 1) {
          toast.success(res?.message ?? "Workflow component saved successfully");
          onSuccess();
          onClose();
        } else {
          toast.error(res?.error || res?.message || "Failed to save workflow component");
        }
      },
      onError: (err: any) => {
        toast.error(err?.message || "An error occurred while saving");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit workflow Component" : "Add workflow Component"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormBuilderRenderer
            formJson={schema}
            value={values}
            onChange={(next) => setValues(next)}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={save.isPending}
              className="bg-[#22d3ee] text-white hover:bg-[#22d3ee]/90 hover:text-white border-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={save.isPending}
              className="bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90"
            >
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
