import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import {
  Button,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  useAllRoles,
  useRoleDetail,
  useRoleFormLookups,
  useSaveRole,
} from "./role-form.api";
import type { RoleData } from "./role-form.types";
import { AccessRights } from "./access-rights";

// Legacy AddRole.onSubmit / validationSchema — exact field set.
const schema = z.object({
  user_role_id: z.union([z.string(), z.number()]).optional(),
  code: z.string().min(1, "Please Enter code"),
  name: z.string().min(1, "Please Enter name"),
  description: z.string().optional(),
  userType: z.string().min(1, "Please select user type"),
  parentRole: z.string().optional(),
  dataAccess: z.string().min(1, "Please select data access"),
  generateApplicationLink: z.string().optional(),
  generatePartnerLink: z.string().optional(),
  generateChildPartnerLink: z.string().optional(),
  defaultRoute: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const DATA_ACCESS: Array<{ label: string; value: string }> = [
  { label: "All", value: "ALL" },
  { label: "Subordinates Only", value: "SUBORDINATES_ONLY" },
];
const YESNO: Array<{ label: string; value: string }> = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];
const STATUS: Array<{ label: string; value: number }> = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 2 },
];

function defaultsFrom(role: RoleData | null | undefined): FormValues {
  return {
    user_role_id: role?.user_role_id ?? undefined,
    code: role?.code ?? "",
    name: role?.name ?? "",
    description: role?.description ?? "",
    userType: role?.user_type ?? "",
    parentRole: role?.parent_role_id ?? "",
    dataAccess: role?.data_access ?? "",
    generateApplicationLink: role?.generate_application_link ?? "false",
    generatePartnerLink: role?.generate_partner_link ?? "false",
    generateChildPartnerLink: role?.generate_child_partner_link ?? "false",
    defaultRoute: role?.default_route ?? "",
    status: (role?.status as number | undefined) ?? 1,
  };
}

export default function RoleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { hash } = useLocation();
  const hashType = hash.startsWith("#") ? hash.substring(1) : "";
  const isChannel = hashType === "CHANNEL";

  // Lookups.
  const { data: lookups = [] } = useRoleFormLookups();
  const userTypes = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "USER_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups]
  );
  const partnerCategories = useMemo(
    () => lookups.filter((l) => l.group_code === "PARTNER_CATEGORY"),
    [lookups]
  );

  // CHANNEL partner-category param (legacy default = first PC's lu_key).
  const [partnerCategory, setPartnerCategory] = useState("");
  useEffect(() => {
    if (!partnerCategory && partnerCategories[0]) {
      setPartnerCategory(partnerCategories[0].lu_key);
    }
  }, [partnerCategories, partnerCategory]);

  // Role on the server (edit mode).
  const { data: fetchedRole } = useRoleDetail(id, partnerCategory, isChannel);

  // The role we're editing (server snapshot + step-1 save response + step-2 mutations).
  const [role, setRole] = useState<RoleData | null>(null);
  useEffect(() => {
    if (fetchedRole) setRole(fetchedRole);
  }, [fetchedRole]);

  // Parent-role dropdown source.
  const { data: allRoles = [] } = useAllRoles();

  // Stepper.
  const [step, setStep] = useState<0 | 1>(0);

  // Step-1 form.
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultsFrom(null),
  });

  // When the role loads (or first save response arrives), seed the form.
  useEffect(() => {
    reset(defaultsFrom(role));
  }, [role, reset]);

  const userType = watch("userType");
  const parentRoleOptions = useMemo(
    () =>
      allRoles
        .filter((r) => (r.userType ?? r.user_type) === userType)
        .filter((r) => String(r.code) !== watch("code"))
        .map((r) => ({ value: String(r.id), label: r.name })),
    [allRoles, userType, watch]
  );

  const save = useSaveRole();

  // Step 1 — basic details.
  const onSubmitStep1 = handleSubmit(async (values) => {
    const data: RoleData = {
      user_type: values.userType,
      code: values.code,
      name: values.name,
      description: values.description ?? "",
      data_access: values.dataAccess,
      status: values.status,
      parent_role_id: values.parentRole ?? "",
      generate_application_link: values.generateApplicationLink ?? "false",
      generate_partner_link: values.generatePartnerLink ?? "false",
      generate_child_partner_link: values.generateChildPartnerLink ?? "false",
      default_route: values.defaultRoute ?? "",
    };
    if (values.user_role_id) {
      data.user_role_id = values.user_role_id as number | string;
    }
    try {
      const saved = await save.mutateAsync(data);
      // Preserve partner_category if we already had it (legacy parity).
      if (role?.partner_category) {
        saved.partner_category = role.partner_category;
      }
      setRole(saved);

      const isNew = !values.user_role_id;
      if (isNew && saved.user_role_id != null) {
        navigate(
          `/settings/role/create/${String(saved.user_role_id)}#${saved.user_type}`,
          { replace: true }
        );
      }
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save role");
    }
  });

  // Step 2 — save the access-rights tree (whole role posted back).
  const onSubmitStep2 = async () => {
    if (!role) return;
    const data: RoleData = { ...role };
    // Legacy AccessRights.submitData: blank partner_category for EMPLOYEE.
    if (data.user_type === "EMPLOYEE") data.partner_category = null;
    try {
      await save.mutateAsync(data);
      toast.success("Role Access Rights saved successfully");
      navigate("/settings/role");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const heading = id ? "Edit Role" : "Add Role";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {heading}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 0
              ? "Basic role details"
              : "Map menu access & permissions"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/role">
            <ArrowLeft className="h-4 w-4" /> Back to roles
          </Link>
        </Button>
      </div>

      {/* Steps strip */}
      <ol className="flex items-center gap-3 text-sm">
        <Step n={1} label="Add Role" active={step === 0} done={step > 0} />
        <span className="h-px w-8 bg-slate-200" />
        <Step n={2} label="Access Rights" active={step === 1} done={false} />
      </ol>

      {step === 0 && (
        <form
          onSubmit={onSubmitStep1}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Code *" error={errors.code?.message}>
              <Input maxLength={50} {...register("code")} />
            </Field>
            <Field label="Name *" error={errors.name?.message}>
              <Input maxLength={50} {...register("name")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Input maxLength={50} {...register("description")} />
            </Field>

            <Field label="User Type *" error={errors.userType?.message}>
              <NativeSelect
                value={watch("userType")}
                onChange={(v) => setValue("userType", v, { shouldValidate: true })}
                options={userTypes}
                placeholder="Select"
              />
            </Field>
            <Field label="Parent Role" error={errors.parentRole?.message}>
              <NativeSelect
                value={watch("parentRole") ?? ""}
                onChange={(v) =>
                  setValue("parentRole", v, { shouldValidate: true })
                }
                options={parentRoleOptions}
                placeholder="Select"
                clearable
              />
            </Field>
            <Field label="Data Access *" error={errors.dataAccess?.message}>
              <NativeSelect
                value={watch("dataAccess")}
                onChange={(v) =>
                  setValue("dataAccess", v, { shouldValidate: true })
                }
                options={DATA_ACCESS}
                placeholder="Select"
              />
            </Field>

            {userType === "EMPLOYEE" && (
              <>
                <Field label="Generate Partner Link">
                  <NativeSelect
                    value={watch("generatePartnerLink") ?? ""}
                    onChange={(v) =>
                      setValue("generatePartnerLink", v, {
                        shouldValidate: false,
                      })
                    }
                    options={YESNO}
                    placeholder="Select"
                    clearable
                  />
                </Field>
                <Field label="Generate Child Partner Link">
                  <NativeSelect
                    value={watch("generateChildPartnerLink") ?? ""}
                    onChange={(v) =>
                      setValue("generateChildPartnerLink", v, {
                        shouldValidate: false,
                      })
                    }
                    options={YESNO}
                    placeholder="Select"
                    clearable
                  />
                </Field>
              </>
            )}

            <Field label="Generate Application Link">
              <NativeSelect
                value={watch("generateApplicationLink") ?? ""}
                onChange={(v) =>
                  setValue("generateApplicationLink", v, {
                    shouldValidate: false,
                  })
                }
                options={YESNO}
                placeholder="Select"
                clearable
              />
            </Field>
            <Field label="Default Route" error={errors.defaultRoute?.message}>
              <Input maxLength={50} {...register("defaultRoute")} />
            </Field>
            <Field label="Status *" error={errors.status?.message}>
              <NativeSelect
                value={String(watch("status") ?? "")}
                onChange={(v) =>
                  setValue("status", Number(v) as 1 | 2, {
                    shouldValidate: true,
                  })
                }
                options={STATUS.map((s) => ({
                  label: s.label,
                  value: String(s.value),
                }))}
                placeholder="Select"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button asChild type="button" variant="outline">
              <Link to="/settings/role">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save & Next"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && role && (
        <div className="space-y-4">
          {role.user_type === "CHANNEL" && partnerCategories.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <Label className="text-sm">Partner Category</Label>
              <NativeSelect
                value={partnerCategory}
                onChange={(v) => setPartnerCategory(v)}
                options={partnerCategories.map((p) => ({
                  value: p.lu_key,
                  label: p.lu_value ?? p.lu_name,
                }))}
                placeholder="Select"
              />
            </div>
          )}
          <AccessRights
            role={role}
            onChange={setRole}
            onBack={() => setStep(0)}
            onSave={onSubmitStep2}
            saving={save.isPending}
          />
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={
          done
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
            : active
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
              : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        }
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      <span
        className={
          active || done
            ? "font-semibold text-slate-900"
            : "text-slate-500"
        }
      >
        {label}
      </span>
    </li>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
  clearable,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  clearable?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
    >
      {(placeholder || clearable) && (
        <option value="">{placeholder ?? ""}</option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
