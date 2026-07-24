import {
  registerStepComponent,
  type StepComponentProps,
} from "@craft-apex/workflow-runtime";
import { Button } from "@craft-apex/ui";
import { DocChecklistGroupsPanel } from "./doc-checklist-groups-panel";
import { DocChecklistFieldsPanel } from "./doc-checklist-fields-panel";
import type {
  ChecklistField,
  ChecklistGroup,
  DocumentClassRow,
  DocumentRow,
  RuleRow,
  ServiceProviderRow,
} from "./doc-checklist-form.types";

export interface ChecklistMasterStepContext {
  mandatoryOptions: { value: string; label: string }[];
  docClasses: DocumentClassRow[];
  docs: DocumentRow[];
  rules: RuleRow[];
  providers: ServiceProviderRow[];
  groups: ChecklistGroup[];
  onGroupsChange: (next: ChecklistGroup[]) => void;
  /** Advance the groups step (save + move to Field Master). */
  onGroupsSave: () => void;
  fieldCategoryOptions: { value: string; label: string }[];
  sourceTypeOptions: { value: string; label: string }[];
  matchTypeOptions: { value: string; label: string }[];
  fields: ChecklistField[];
  onFieldsChange: (next: ChecklistField[]) => void;
  /** Final save (Field Master is the last step) + navigate to the list. */
  onFinish: () => void;
  saving: boolean;
}

function ChecklistMasterGroupsStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<ChecklistMasterStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <DocChecklistGroupsPanel
        groups={ctx.groups ?? []}
        onChange={ctx.onGroupsChange ?? (() => {})}
        mandatoryOptions={ctx.mandatoryOptions ?? []}
        docClasses={ctx.docClasses ?? []}
        docs={ctx.docs ?? []}
        rules={ctx.rules ?? []}
        providers={ctx.providers ?? []}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onGroupsSave?.()}
          disabled={ctx.saving}
        >
          {ctx.saving ? "Saving…" : "Save & Next"}
        </Button>
      </div>
    </div>
  );
}

function ChecklistMasterFieldsStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<ChecklistMasterStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <DocChecklistFieldsPanel
        fields={ctx.fields ?? []}
        onChange={ctx.onFieldsChange ?? (() => {})}
        fieldCategoryOptions={ctx.fieldCategoryOptions ?? []}
        sourceTypeOptions={ctx.sourceTypeOptions ?? []}
        matchTypeOptions={ctx.matchTypeOptions ?? []}
        docs={ctx.docs ?? []}
        rules={ctx.rules ?? []}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onFinish?.()}
          disabled={ctx.saving}
        >
          {ctx.saving ? "Saving…" : "Finish"}
        </Button>
      </div>
    </div>
  );
}

registerStepComponent("CHECKLIST_MASTER_GROUPS", ChecklistMasterGroupsStep);
registerStepComponent("CHECKLIST_MASTER_FIELDS", ChecklistMasterFieldsStep);
