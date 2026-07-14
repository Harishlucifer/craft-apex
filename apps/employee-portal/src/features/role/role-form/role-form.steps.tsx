import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";
import { Label } from "@craft-apex/ui";
import { AccessRights } from "./access-rights";
import { NativeSelect } from "./native-select";
import type { LookupItem, RoleData } from "./role-form.types";

export interface RoleStepContext {
  role: RoleData | null;
  onRoleChange: (next: RoleData) => void;
  onSave: () => void;
  saving: boolean;
  partnerCategories: LookupItem[];
  partnerCategory: string;
  onPartnerCategoryChange: (v: string) => void;
}

function AccessRightsStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<RoleStepContext>;
  if (!ctx.role) return null;
  return (
    <div className="space-y-4">
      {ctx.role.user_type === "CHANNEL" &&
        (ctx.partnerCategories?.length ?? 0) > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <Label className="text-sm">Partner Category</Label>
            <NativeSelect
              value={ctx.partnerCategory ?? ""}
              onChange={(v) => ctx.onPartnerCategoryChange?.(v)}
              options={(ctx.partnerCategories ?? []).map((p) => ({
                value: p.lu_key,
                label: p.lu_value ?? p.lu_name,
              }))}
              placeholder="Select"
            />
          </div>
        )}
      <AccessRights
        role={ctx.role}
        onChange={ctx.onRoleChange ?? (() => {})}
        onBack={onBack}
        onSave={ctx.onSave ?? (() => {})}
        saving={Boolean(ctx.saving)}
      />
    </div>
  );
}

registerStepComponent("ACCESS_RIGHTS", AccessRightsStep);
