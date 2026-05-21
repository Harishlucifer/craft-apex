import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useSaveTerritory,
  useTerritoryDetail,
  useTerritoryParents,
  useTerritoryTypes,
} from "./territory-form.api";
import type {
  BoundaryCoordinate,
  TerritorySavePayload,
} from "./territory-form.types";

const headerSchema = z.object({
  code: z
    .string()
    .min(1, "Territory code is required")
    .max(15, "Too Long! Should be less than 15 characters"),
  name: z
    .string()
    .min(1, "Territory name is required")
    .max(30, "Too Long! Should be less than 30 characters"),
  description: z.string().optional(),
  territory_type_id: z.string().min(1, "Territory type is required"),
  parent_territory_id: z.string().optional(),
  location_type: z.string().optional(),
  location_type_value: z.string().optional(),
  status: z.coerce.number().int(),
});
type HeaderValues = z.infer<typeof headerSchema>;

const officeSchema = z
  .object({
    name: z.string().optional(),
    address: z.string().optional(),
    contact_detail: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    pincode: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, "Invalid Pincode")
      .optional()
      .or(z.literal("")),
    latitude: z
      .string()
      .regex(/^([-+]?([1-8]?\d(\.\d+)?|90(\.0+)?))$/, "Invalid Latitude")
      .optional()
      .or(z.literal("")),
    longitude: z
      .string()
      .regex(
        /^([-+]?(?:180(?:(?:\.0{1,6})?)|(?:(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.\d{1,6})?)))$/,
        "Invalid Longitude"
      )
      .optional()
      .or(z.literal("")),
    area_id: z.string().optional(),
  })
  .partial();
type OfficeValues = z.infer<typeof officeSchema>;

const LOCATION_TYPES = [
  { value: "COUNTRY", label: "Country" },
  { value: "STATE", label: "State" },
  { value: "DISTRICT", label: "District" },
];

const BOUNDARY_TYPES = [
  { value: "RADIUS", label: "Radius" },
  { value: "GEO_FENCING", label: "Geo Fencing" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function TerritoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: types = [] } = useTerritoryTypes();
  const { data: parents = [] } = useTerritoryParents();
  const { data: detail } = useTerritoryDetail(id);
  const save = useSaveTerritory();

  const defaults: HeaderValues = useMemo(
    () => ({
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
    }),
    [detail]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Office section.
  const [showOffice, setShowOffice] = useState(false);
  const officeForm = useForm<OfficeValues>({
    resolver: zodResolver(officeSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!detail) return;
    const o = detail.office_detail;
    if (o) {
      setShowOffice(true);
      officeForm.reset({
        name: o.name ?? "",
        address: o.address ?? "",
        contact_detail: o.contact_detail ?? "",
        email: o.email ?? "",
        pincode: o.pincode ?? "",
        latitude: o.latitude != null ? String(o.latitude) : "",
        longitude: o.longitude != null ? String(o.longitude) : "",
        area_id: o.area_id != null ? String(o.area_id) : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.office_detail]);

  // Boundary section.
  const [showBoundary, setShowBoundary] = useState(false);
  const [boundaryType, setBoundaryType] = useState<string>("");
  const [boundaryFields, setBoundaryFields] = useState({
    distance: "0",
    latitude: "0",
    longitude: "0",
    pincodes: "",
    coordinates: "[]",
  });
  const [boundaryCoordError, setBoundaryCoordError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!detail) return;
    const b = detail.territory_boundary;
    if (b) {
      setShowBoundary(true);
      setBoundaryType(b.type ?? "");
      setBoundaryFields({
        distance: b.distance != null ? String(b.distance) : "0",
        latitude: b.latitude != null ? String(b.latitude) : "0",
        longitude: b.longitude != null ? String(b.longitude) : "0",
        pincodes: Array.isArray(b.pincodes) ? b.pincodes.join(", ") : "",
        coordinates: b.coordinates
          ? JSON.stringify(b.coordinates, null, 2)
          : "[]",
      });
    }
  }, [detail?.territory_boundary]);

  const filteredParents = useMemo(() => {
    const ty = watch("territory_type_id");
    return parents.filter((p) => String(p.territory_type_id) === String(ty));
  }, [parents, watch]);

  const locationType = watch("location_type");

  const onSubmit = handleSubmit(async (values) => {
    // Validate office sub-form (only when enabled).
    if (showOffice) {
      const r = await officeForm.trigger();
      if (!r) {
        toast.error("Fix office details");
        return;
      }
    }

    // Validate boundary coordinates JSON.
    let coordinates: BoundaryCoordinate[] = [];
    if (showBoundary && boundaryFields.coordinates) {
      try {
        const parsed = JSON.parse(boundaryFields.coordinates);
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
        setBoundaryCoordError(null);
      } catch (e) {
        setBoundaryCoordError(
          e instanceof Error ? e.message : "Invalid JSON"
        );
        return;
      }
    }

    const payload: TerritorySavePayload = {
      ...(id ? { territory_id: id } : {}),
      code: values.code.toUpperCase(),
      territory_type_id: values.territory_type_id,
      territory_name: values.name,
      name: values.name,
      description: values.description,
      parent_territory_id: values.parent_territory_id,
      status: Number(values.status),
      ...(values.location_type
        ? {
            location_type: values.location_type,
            location_type_value: values.location_type_value,
          }
        : {}),
      ...(showOffice
        ? {
            office_detail: {
              ...(detail?.office_detail?.id
                ? { id: detail.office_detail.id }
                : {}),
              name: officeForm.getValues("name") ?? undefined,
              address: officeForm.getValues("address") ?? undefined,
              contact_detail:
                officeForm.getValues("contact_detail") ?? undefined,
              email: officeForm.getValues("email") ?? undefined,
              pincode: officeForm.getValues("pincode") ?? undefined,
              latitude: officeForm.getValues("latitude")
                ? Number(officeForm.getValues("latitude"))
                : undefined,
              longitude: officeForm.getValues("longitude")
                ? Number(officeForm.getValues("longitude"))
                : undefined,
              area_id: officeForm.getValues("area_id") ?? undefined,
              status: Number(values.status),
            },
          }
        : {}),
      ...(showBoundary && boundaryType
        ? {
            territory_boundary: {
              ...(detail?.territory_boundary?.id
                ? { id: detail.territory_boundary.id }
                : {}),
              type: boundaryType,
              status: 1,
              ...(boundaryType === "RADIUS"
                ? {
                    latitude: Number(boundaryFields.latitude),
                    longitude: Number(boundaryFields.longitude),
                    distance: Number(boundaryFields.distance),
                    pincodes: boundaryFields.pincodes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    coordinates,
                  }
                : {
                    pincodes: boundaryFields.pincodes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    coordinates,
                  }),
            },
          }
        : {}),
    };

    try {
      await save.mutateAsync(payload);
      toast.success("Created successfully!");
      navigate("/settings/territory-management");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

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

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Territory Details
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Code *" error={errors.code?.message}>
              <Input
                maxLength={15}
                disabled={Boolean(id)}
                value={watch("code")}
                onChange={(e) =>
                  setValue("code", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  })
                }
              />
            </Field>
            <Field label="Name *" error={errors.name?.message}>
              <Input maxLength={30} {...register("name")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Input {...register("description")} />
            </Field>
            <Field
              label="Territory Type *"
              error={errors.territory_type_id?.message}
            >
              <select
                className={selectClass}
                value={watch("territory_type_id")}
                onChange={(e) =>
                  setValue("territory_type_id", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {types.map((t) => (
                  <option
                    key={String(t.territory_type_id)}
                    value={String(t.territory_type_id)}
                  >
                    {t.territory_type_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Parent Territory">
              <select
                className={selectClass}
                value={watch("parent_territory_id") ?? ""}
                onChange={(e) => setValue("parent_territory_id", e.target.value)}
              >
                <option value="">— None —</option>
                {filteredParents.map((p) => (
                  <option
                    key={String(p.territory_id)}
                    value={String(p.territory_id)}
                  >
                    {p.territory_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location Type">
              <select
                className={selectClass}
                value={watch("location_type") ?? ""}
                onChange={(e) => {
                  setValue("location_type", e.target.value);
                  setValue("location_type_value", "");
                }}
              >
                <option value="">Select</option>
                {LOCATION_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            {locationType && (
              <Field
                label={`${LOCATION_TYPES.find((o) => o.value === locationType)?.label ?? "Location"} Value`}
              >
                <Input {...register("location_type_value")} />
              </Field>
            )}
            <Field label="Status *" error={errors.status?.message}>
              <select
                className={selectClass}
                value={String(watch("status") ?? "")}
                onChange={(e) =>
                  setValue("status", Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
              >
                <option value="1">Active</option>
                <option value="-1">Inactive</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={showOffice}
              onChange={(e) => setShowOffice(e.target.checked)}
            />
            Add Office Details
          </label>
          {showOffice && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="Office Name">
                <Input {...officeForm.register("name")} />
              </Field>
              <Field label="Email" error={officeForm.formState.errors.email?.message}>
                <Input type="email" {...officeForm.register("email")} />
              </Field>
              <Field
                label="Contact Details"
              >
                <Input {...officeForm.register("contact_detail")} />
              </Field>
              <Field label="Pincode" error={officeForm.formState.errors.pincode?.message}>
                <Input
                  maxLength={6}
                  {...officeForm.register("pincode")}
                />
              </Field>
              <Field label="Latitude" error={officeForm.formState.errors.latitude?.message}>
                <Input {...officeForm.register("latitude")} />
              </Field>
              <Field label="Longitude" error={officeForm.formState.errors.longitude?.message}>
                <Input {...officeForm.register("longitude")} />
              </Field>
              <Field label="Area ID">
                <Input {...officeForm.register("area_id")} />
              </Field>
              <div className="md:col-span-3">
                <Field label="Address">
                  <textarea
                    rows={2}
                    {...officeForm.register("address")}
                    className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                  />
                </Field>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={showBoundary}
              onChange={(e) => setShowBoundary(e.target.checked)}
            />
            Add Territory Boundary
          </label>
          {showBoundary && (
            <div className="space-y-3">
              <Field label="Boundary Type">
                <select
                  className={selectClass}
                  value={boundaryType}
                  onChange={(e) => setBoundaryType(e.target.value)}
                >
                  <option value="">Select</option>
                  {BOUNDARY_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              {boundaryType === "RADIUS" && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field label="Distance (m)">
                    <Input
                      type="number"
                      value={boundaryFields.distance}
                      onChange={(e) =>
                        setBoundaryFields((p) => ({
                          ...p,
                          distance: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Latitude">
                    <Input
                      value={boundaryFields.latitude}
                      onChange={(e) =>
                        setBoundaryFields((p) => ({
                          ...p,
                          latitude: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Longitude">
                    <Input
                      value={boundaryFields.longitude}
                      onChange={(e) =>
                        setBoundaryFields((p) => ({
                          ...p,
                          longitude: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}
              <Field label="Pincodes (comma separated)">
                <Input
                  value={boundaryFields.pincodes}
                  onChange={(e) =>
                    setBoundaryFields((p) => ({
                      ...p,
                      pincodes: e.target.value,
                    }))
                  }
                  placeholder="560001, 560002"
                />
              </Field>
              <Field
                label='Coordinates (JSON [{ "lat": X, "lng": Y }])'
                error={boundaryCoordError ?? undefined}
              >
                <textarea
                  rows={4}
                  value={boundaryFields.coordinates}
                  onChange={(e) =>
                    setBoundaryFields((p) => ({
                      ...p,
                      coordinates: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
          )}
        </section>

        <div className="flex items-center justify-between">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/territory-management">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : id ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </div>
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
