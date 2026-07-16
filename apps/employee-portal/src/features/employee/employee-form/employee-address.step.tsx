// Legacy: craft-frontend/src/pages/Configuration/Employee/EmployeeAddress.js
//
// Step 2 of the employee create/edit wizard. Fields ported verbatim:
//   address_type (HOME|OTHER, required)
//   latitude (number, required)
//   longitude (number, required)
//   pincode (drives area/city/state/country autosuggest)
//   area_id / city_id / state_id / country_id (populated from pincode lookup)
//   status (1|-1, required)
//
// TODO: Port the Google Maps picker + Places search (lines 313-337 of legacy).
// Requires react-google-maps/api + the tenant GOOGLE_MAP_API_KEY which is not
// wired into craft-apex yet. For now lat/long are entered manually.
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  fetchFormattedAddress,
  fetchPincodeDetails,
  useEmployeeAddressDetail,
  useSaveEmployeeAddress,
} from "./employee-address.api";
import { useEmployeeDetail } from "./employee-form.api";
import type { PincodeRow } from "./employee-address.types";

interface Props {
  employeeId: string;
  onBack: () => void;
  onNext: () => void;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

// Legacy Yup schema (lines 53-58 of EmployeeAddress.js).
const schema = z.object({
  address_type: z.string().min(1, "Address type is required"),
  latitude: z.coerce.number({
    invalid_type_error: "Latitude is required",
  }),
  longitude: z.coerce.number({
    invalid_type_error: "Longitude is required",
  }),
  pincode: z.string().optional().default(""),
  area_id: z.string().optional().default(""),
  city_id: z.string().optional().default(""),
  state_id: z.string().optional().default(""),
  country_id: z.string().optional().default(""),
  status: z.string().min(1, "Status is required"),
  user_address_id: z.union([z.string(), z.number()]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Option {
  id: string | number;
  value: string | number;
  label: string;
}

function buildOptions(data: PincodeRow[]): {
  area: Option[];
  city: Option[];
  state: Option[];
  country: Option[];
} {
  const area = data.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.area,
  }));
  const cityMap = new Map<string | number, Option>();
  data.forEach((item) => {
    if (item.cityId && item.coreCityList) {
      cityMap.set(item.cityId, {
        id: item.cityId,
        value: item.cityId,
        label: item.coreCityList.name,
      });
    }
  });
  const stateMap = new Map<string | number, Option>();
  data.forEach((item) => {
    if (item.stateId && item.coreStateList) {
      stateMap.set(item.stateId, {
        id: item.stateId,
        value: item.stateId,
        label: item.coreStateList.name,
      });
    }
  });
  const countryMap = new Map<string | number, Option>();
  data.forEach((item) => {
    if (item.countryId && item.coreCountryList) {
      countryMap.set(item.countryId, {
        id: item.countryId,
        value: item.countryId,
        label: item.coreCountryList.name,
      });
    }
  });
  return {
    area,
    city: Array.from(cityMap.values()),
    state: Array.from(stateMap.values()),
    country: Array.from(countryMap.values()),
  };
}

export default function EmployeeAddressStep({
  employeeId,
  onBack,
  onNext,
}: Props) {
  const { data: detail } = useEmployeeAddressDetail(employeeId);
  // Backend's /alpha/v1/employee validates the full EmployeeParams struct on
  // every save, so the address-only submit below must carry these forward.
  const { data: employeeDetail } = useEmployeeDetail(employeeId);
  const save = useSaveEmployeeAddress();

  const defaults: FormValues = useMemo(
    () => ({
      address_type: detail?.address_type ?? "HOME",
      latitude:
        detail?.latitude != null ? (Number(detail.latitude) as number) : (NaN as unknown as number),
      longitude:
        detail?.longitude != null
          ? (Number(detail.longitude) as number)
          : (NaN as unknown as number),
      pincode: detail?.pincode ?? "",
      area_id: detail?.area_id != null ? String(detail.area_id) : "",
      city_id: detail?.city_id != null ? String(detail.city_id) : "",
      state_id: detail?.state_id != null ? String(detail.state_id) : "",
      country_id: detail?.country_id != null ? String(detail.country_id) : "",
      status: detail?.status != null ? String(detail.status) : "1",
      user_address_id: detail?.user_address_id,
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Pincode-driven dropdown options.
  const pincode = watch("pincode");
  const areaOptions = useAreaOptions(pincode);

  const onSubmit = handleSubmit(async (values) => {
    const lat = Number(values.latitude);
    const lng = Number(values.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      // Legacy parity: if no lat/lng, the step "saves" nothing and proceeds.
      onNext();
      return;
    }
    // Legacy: POST /utility/formatted-address with stringified lat/lng to
    // resolve a human-readable address, then attach to user_address.
    const address = await fetchFormattedAddress({
      latitude: String(lat),
      longitude: String(lng),
    });
    try {
      await save.mutateAsync({
        employee_id: employeeId,
        ...(employeeDetail?.user_id ? { user_id: employeeDetail.user_id } : {}),
        mobile: employeeDetail?.mobile ?? "",
        email: employeeDetail?.email ?? "",
        name: employeeDetail?.name ?? "",
        status: employeeDetail?.status ?? 1,
        user_address: {
          ...(values.user_address_id
            ? { user_address_id: values.user_address_id }
            : {}),
          address_type: values.address_type,
          address: address || "",
          latitude: lat,
          longitude: lng,
          area_id: values.area_id ? Number(values.area_id) : 0,
          city_id: values.city_id ? Number(values.city_id) : 0,
          state_id: values.state_id ? Number(values.state_id) : 0,
          country_id: values.country_id ? Number(values.country_id) : 0,
          pincode: values.pincode,
          status: values.status ? Number(values.status) : 1,
        },
      });
      toast.success("Address saved");
      onNext();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

  const addressType = watch("address_type");
  const status = watch("status");

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Address Type *" error={errors.address_type?.message}>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="HOME"
                checked={addressType === "HOME"}
                onChange={() => setValue("address_type", "HOME")}
              />
              Home
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="OTHER"
                checked={addressType === "OTHER"}
                onChange={() => setValue("address_type", "OTHER")}
              />
              Other
            </label>
          </div>
        </Field>
        <Field label="Status *" error={errors.status?.message}>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="1"
                checked={status === "1"}
                onChange={() => setValue("status", "1")}
              />
              Active
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                value="-1"
                checked={status === "-1"}
                onChange={() => setValue("status", "-1")}
              />
              Inactive
            </label>
          </div>
        </Field>
        <Field label="Latitude *" error={errors.latitude?.message}>
          <Input
            type="number"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Longitude *" error={errors.longitude?.message}>
          <Input
            type="number"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Pincode">
          <Input maxLength={10} {...register("pincode")} />
        </Field>
        <Field label="Area">
          <select
            className={selectClass}
            value={String(watch("area_id") ?? "")}
            onChange={(e) => setValue("area_id", e.target.value)}
          >
            <option value="">Select</option>
            {areaOptions.area.map((o) => (
              <option key={String(o.id)} value={String(o.id)}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <select
            className={selectClass}
            value={String(watch("city_id") ?? "")}
            onChange={(e) => setValue("city_id", e.target.value)}
          >
            <option value="">Select</option>
            {areaOptions.city.map((o) => (
              <option key={String(o.id)} value={String(o.id)}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="State">
          <select
            className={selectClass}
            value={String(watch("state_id") ?? "")}
            onChange={(e) => setValue("state_id", e.target.value)}
          >
            <option value="">Select</option>
            {areaOptions.state.map((o) => (
              <option key={String(o.id)} value={String(o.id)}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Country">
          <select
            className={selectClass}
            value={String(watch("country_id") ?? "")}
            onChange={(e) => setValue("country_id", e.target.value)}
          >
            <option value="">Select</option>
            {areaOptions.country.map((o) => (
              <option key={String(o.id)} value={String(o.id)}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="rounded-md border border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-500">
        TODO: Google Maps location picker + Places search (legacy lines
        313-337) not yet ported.
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

// Pincode autosuggest: legacy useEffect at lines 198-207 fires whenever pincode
// length >= 5 and populates area/city/state/country dropdowns. Default values
// for area_id/city_id/etc. are taken from the first row (legacy lines 174-177).
function useAreaOptions(pincode: string | undefined): {
  area: Option[];
  city: Option[];
  state: Option[];
  country: Option[];
} {
  const [opts, setOpts] = useState<{
    area: Option[];
    city: Option[];
    state: Option[];
    country: Option[];
  }>({ area: [], city: [], state: [], country: [] });

  useEffect(() => {
    if (!pincode || pincode.length < 5) {
      setOpts({ area: [], city: [], state: [], country: [] });
      return;
    }
    let cancelled = false;
    fetchPincodeDetails(pincode).then((rows) => {
      if (cancelled) return;
      setOpts(buildOptions(rows));
    });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  return opts;
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
