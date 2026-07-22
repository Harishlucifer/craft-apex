import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import {
  Plus,
  Trash2,
  Eye,
  Edit2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Badge,
  toast,
} from "@craft-apex/ui";
import { useLenders } from "./rm-mapping.api";
import type {
  TerritoryLoanMapEntry,
  TerritoryRow,
  TerritoryTypeRow,
  LoanTypeRow,
} from "./rm-mapping.types";

// Sourcing Territory static options
const SOURCING_TERRITORY_OPTIONS = [
  { value: "ONBOARDING_TERRITORY", label: "Onboarding Territory" },
  { value: "NEAREST_TERRITORY", label: "Nearest Territory" },
  { value: "SPECIFIED_TERRITORY", label: "Specified Territory" },
];

const territoryFormSchema = z
  .object({
    territoryType: z.string().min(1, "Territory Type is required"),
    territory: z.string().min(1, "Territory is required"),
    loanTypes: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(1, "At least one Loan Type is required"),
    allLenderEnabled: z.boolean(),
    lenders: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    sourcingTerritory: z.string().min(1, "Sourcing Territory is required"),
    status: z.number(),
  })
  .refine(
    (data) => {
      if (!data.allLenderEnabled && (!data.lenders || data.lenders.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "At least one Lender is required when all lenders are not enabled",
      path: ["lenders"],
    }
  );

type TerritoryFormValues = z.infer<typeof territoryFormSchema>;

interface TerritoryPanelProps {
  territoryMapping: TerritoryLoanMapEntry[];
  setTerritoryMapping: (val: TerritoryLoanMapEntry[]) => void;
  onboardingTerritoryId: string;
  setOnboardingTerritoryId: (val: string) => void;
  onboardingTerritoryTypeId: string;
  setOnboardingTerritoryTypeId: (val: string) => void;
  partnerCategory: string;
  syncParentValues: (
    updatedTerritories: TerritoryLoanMapEntry[],
    updatedRms: string[],
    updatedCategory: string,
    updatedOnbTerritoryId: string
  ) => void;
  selectedRmList: string[];
  territoryEnabled: boolean;
  territoryTypes: TerritoryTypeRow[];
  territories: TerritoryRow[];
  loanTypes: LoanTypeRow[];
}

export function TerritoryPanel({
  territoryMapping,
  setTerritoryMapping,
  onboardingTerritoryId,
  setOnboardingTerritoryId,
  onboardingTerritoryTypeId,
  setOnboardingTerritoryTypeId,
  partnerCategory,
  syncParentValues,
  selectedRmList,
  territoryEnabled,
  territoryTypes,
  territories,
  loanTypes,
}: TerritoryPanelProps) {
  // Modals state
  const [territoryModalOpen, setTerritoryModalOpen] = useState(false);
  const [territoryEditIndex, setTerritoryEditIndex] = useState<number | null>(null);
  const [territoryViewIndex, setTerritoryViewIndex] = useState<number | null>(null);

  // Onboarding Territory type change handler
  const handleOnboardingTerritoryTypeChange = (typeId: string) => {
    setOnboardingTerritoryTypeId(typeId);
    setOnboardingTerritoryId(""); // reset selected territory
    syncParentValues(territoryMapping, selectedRmList, partnerCategory, "");
  };

  const handleOnboardingTerritoryChange = (territoryId: string) => {
    setOnboardingTerritoryId(territoryId);
    syncParentValues(territoryMapping, selectedRmList, partnerCategory, territoryId);
  };

  // Territory Mapping handlers
  const handleAddTerritoryClick = () => {
    setTerritoryEditIndex(null);
    setTerritoryModalOpen(true);
  };

  const handleEditTerritoryClick = (idx: number) => {
    setTerritoryEditIndex(idx);
    setTerritoryModalOpen(true);
  };

  const handleDeleteTerritoryClick = (idx: number) => {
    const updated = territoryMapping.filter((_, i) => i !== idx);
    setTerritoryMapping(updated);
    syncParentValues(updated, selectedRmList, partnerCategory, onboardingTerritoryId);
    toast.success("Territory mapping removed");
  };

  const handleViewTerritoryClick = (idx: number) => {
    setTerritoryViewIndex(idx);
  };

  // Options for dropdowns
  const territoryTypeOptions = useMemo(() => {
    return territoryTypes.map((t) => ({
      value: String(t?.territory_type_id ?? ""),
      label: t?.territory_type_name ?? "",
    }));
  }, [territoryTypes]);

  const onboardingTerritoryOptions = useMemo(() => {
    return territories
      .filter((t) => String(t?.territory_type_id ?? "") === String(onboardingTerritoryTypeId))
      .map((t) => ({
        value: String(t?.territory_id ?? ""),
        label: t?.territory_name ?? "",
      }));
  }, [territories, onboardingTerritoryTypeId]);


  if (!territoryEnabled) return null;

  return (
    <div className="space-y-6">
      {/* Onboarding Territory Section */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <CardContent className="space-y-4 p-0">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#1E2A6B]" /> Onboarding Territory
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Territory Type</Label>
              <Select
                options={territoryTypeOptions}
                value={territoryTypeOptions.find((o) => o.value === onboardingTerritoryTypeId) || null}
                onChange={(val) => handleOnboardingTerritoryTypeChange(val?.value ?? "")}
                placeholder="Select Territory Type"
                isSearchable
                className="text-sm"
                classNamePrefix="react-select"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Territory</Label>
              <Select
                options={onboardingTerritoryOptions}
                value={onboardingTerritoryOptions.find((o) => o.value === onboardingTerritoryId) || null}
                onChange={(val) => handleOnboardingTerritoryChange(val?.value ?? "")}
                placeholder="Select Territory"
                isSearchable
                isClearable
                isDisabled={!onboardingTerritoryTypeId}
                className="text-sm"
                classNamePrefix="react-select"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Operating Territory Mapping Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 px-1">
          <MapPin className="h-5 w-5 text-[#1E2A6B]" /> Operating Territory Mapping
        </h3>
        <div className="flex flex-wrap gap-4">
          {territoryMapping.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden w-[280px] h-[160px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-slate-800">Territory:</span> {item?.territory_name}
                </p>
                <p className="text-sm text-slate-700 line-clamp-2">
                  <span className="font-bold text-slate-800">Loan Type:</span>{" "}
                  {item?.loan_types?.map((lt) => lt?.loan_type_name).join(", ") || "None"}
                </p>
              </div>

              <div className="flex items-center gap-4 justify-start pt-1">
                <button
                  type="button"
                  onClick={() => handleViewTerritoryClick(idx)}
                  className="text-slate-400 hover:text-[#1E2A6B] transition-colors p-1"
                  title="View Details"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEditTerritoryClick(idx)}
                  className="text-slate-400 hover:text-[#1E2A6B] transition-colors p-1"
                  title="Edit Mapping"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTerritoryClick(idx)}
                  className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                  title="Delete Mapping"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}

          {/* Add Territory Card */}
          <div className="w-[280px] h-[160px] rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
            <Button
              type="button"
              onClick={handleAddTerritoryClick}
              className="bg-[#1E2A6B] hover:bg-[#1E2A6B]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Territory
            </Button>
          </div>
        </div>
      </div>


      {/* Add/Edit Territory Mapping Modal */}
      {territoryModalOpen && (
        <TerritoryModal
          open={territoryModalOpen}
          onClose={() => setTerritoryModalOpen(false)}
          index={territoryEditIndex}
          initialData={territoryEditIndex !== null ? (territoryMapping[territoryEditIndex] ?? null) : null}
          territories={territories}
          territoryTypes={territoryTypes}
          loanTypes={loanTypes}
          onSave={(data) => {
            let updated: TerritoryLoanMapEntry[];
            if (territoryEditIndex !== null) {
              updated = territoryMapping.map((item, i) => (i === territoryEditIndex ? data : item));
              toast.success("Territory mapping updated");
            } else {
              updated = [...territoryMapping, data];
              toast.success("Territory mapping added");
            }
            setTerritoryMapping(updated);
            syncParentValues(updated, selectedRmList, partnerCategory, onboardingTerritoryId);
            setTerritoryModalOpen(false);
          }}
        />
      )}

      {/* View Territory Modal */}
      {territoryViewIndex !== null && (
        <ViewTerritoryModal
          open={territoryViewIndex !== null}
          onClose={() => setTerritoryViewIndex(null)}
          data={territoryMapping[territoryViewIndex] ?? null}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modals and Helper Components
// ---------------------------------------------------------------------------

interface TerritoryModalProps {
  open: boolean;
  onClose: () => void;
  index: number | null;
  initialData: TerritoryLoanMapEntry | null;
  territories: any[];
  territoryTypes: any[];
  loanTypes: any[];
  onSave: (data: TerritoryLoanMapEntry) => void;
}

function TerritoryModal({
  open,
  onClose,
  index,
  initialData,
  territories,
  territoryTypes,
  loanTypes,
  onSave,
}: TerritoryModalProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TerritoryFormValues>({
    resolver: zodResolver(territoryFormSchema),
    defaultValues: {
      territoryType: initialData?.territory_type_id ?? "",
      territory: initialData?.territory_id ?? "",
      loanTypes:
        initialData?.loan_types?.map((lt) => ({
          value: String(lt?.loan_type_id ?? ""),
          label: lt?.loan_type_name ?? "",
        })) ?? [],
      allLenderEnabled: initialData?.all_lender_enabled ?? true,
      lenders:
        initialData?.lenders?.map((l) => ({
          value: String(l?.lender_id ?? ""),
          label: l?.lender_name ?? "",
        })) ?? [],
      sourcingTerritory: initialData?.sourcing_territory ?? "ONBOARDING_TERRITORY",
      status: initialData?.status ?? 1,
    },
  });

  const selectedTerritoryType = watch("territoryType");
  const selectedLoanTypes = watch("loanTypes") || [];
  const allLenderEnabled = watch("allLenderEnabled");

  // Options lists
  const territoryTypeOptions = useMemo(() => {
    return territoryTypes.map((t) => ({
      value: String(t?.territory_type_id ?? ""),
      label: t?.territory_type_name ?? "",
    }));
  }, [territoryTypes]);

  const territoryOptions = useMemo(() => {
    return territories
      .filter((t) => String(t?.territory_type_id ?? "") === String(selectedTerritoryType))
      .map((t) => ({
        value: String(t?.territory_id ?? ""),
        label: t?.territory_name ?? "",
      }));
  }, [territories, selectedTerritoryType]);

  const loanTypeOptions = useMemo(() => {
    return loanTypes.map((lt) => ({
      value: String(lt?.id ?? ""),
      label: lt?.name ?? "",
    }));
  }, [loanTypes]);


  // Fetch lenders dynamically based on selected loan type IDs
  const activeLoanTypeIds = useMemo(() => {
    return selectedLoanTypes.map((lt) => lt?.value ?? "");
  }, [selectedLoanTypes]);

  const { data: rawLenders = [], isLoading: lendersLoading } = useLenders(activeLoanTypeIds);

  const lenderOptions = useMemo(() => {
    return rawLenders.map((l) => ({
      value: String(l?.lender_id ?? ""),
      label: l?.name ?? "",
    }));
  }, [rawLenders]);

  const onSubmit = (values: TerritoryFormValues) => {
    const chosenType = territoryTypes.find(
      (t) => String(t?.territory_type_id ?? "") === String(values?.territoryType)
    );
    const chosenTerritory = territories.find(
      (t) => String(t?.territory_id ?? "") === String(values?.territory)
    );

    const mappingEntry: TerritoryLoanMapEntry = {
      all_lender_enabled: values?.allLenderEnabled ?? true,
      territory_type_id: values?.territoryType ?? "",
      territory_type_name: chosenType?.territory_type_name ?? "",
      territory_id: values?.territory ?? "",
      territory_name: chosenTerritory?.territory_name ?? "",
      sourcing_territory: values?.sourcingTerritory ?? "",
      status: values?.status ?? 1,
      loan_type_ids: values?.loanTypes?.map((lt) => lt?.value ?? "") ?? [],
      loan_types: values?.loanTypes?.map((lt) => ({
        loan_type_id: lt?.value ?? "",
        loan_type_name: lt?.label ?? "",
      })) ?? [],
      lender_ids: values?.allLenderEnabled ? [] : (values?.lenders?.map((l) => l?.value ?? "") ?? []),
      lenders: values?.allLenderEnabled
        ? []
        : (values?.lenders?.map((l) => ({
          lender_id: l?.value ?? "",
          lender_name: l?.label ?? "",
        })) ?? []),
    };


    onSave(mappingEntry);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-bold text-slate-800">
            {index !== null ? "Update Operating Territory Mapping" : "Add Operating Territory Mapping"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Territory Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Territory Type *</Label>
              <Controller
                name="territoryType"
                control={control}
                render={({ field }) => (
                  <Select
                    options={territoryTypeOptions}
                    value={territoryTypeOptions.find((o) => o.value === field.value) || null}
                    onChange={(val) => {
                      field.onChange(val?.value ?? "");
                      setValue("territory", ""); // Reset territory selection on type change
                    }}
                    placeholder="Select"
                    isSearchable
                    className="text-sm"
                  />
                )}
              />
              {errors.territoryType && (
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.territoryType.message}
                </p>
              )}
            </div>

            {/* Territory */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Territory *</Label>
              <Controller
                name="territory"
                control={control}
                render={({ field }) => (
                  <Select
                    options={territoryOptions}
                    value={territoryOptions.find((o) => o.value === field.value) || null}
                    onChange={(val) => field.onChange(val?.value ?? "")}
                    placeholder="Select"
                    isSearchable
                    isDisabled={!selectedTerritoryType}
                    className="text-sm"
                  />
                )}
              />
              {errors.territory && (
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.territory.message}
                </p>
              )}
            </div>

            {/* Loan Type */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">Loan Type *</Label>
              <Controller
                name="loanTypes"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={loanTypeOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val ? Array.from(val) : []);
                      setValue("lenders", []); // Reset lenders selection when loan types change
                    }}
                    placeholder="Select Loan Types"
                    isSearchable
                    className="text-sm"
                  />
                )}
              />
              {errors.loanTypes && (
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.loanTypes.message}
                </p>
              )}
            </div>

            {/* Access All Lenders */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-semibold text-slate-700">Access all Lenders *</Label>
              <div className="flex items-center gap-6 pt-1">
                <Controller
                  name="allLenderEnabled"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <Input
                          type="radio"
                          name="allLenderEnabled"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="h-4 w-4 text-[#1E2A6B] focus:ring-[#1E2A6B]"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <Input
                          type="radio"
                          name="allLenderEnabled"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="h-4 w-4 text-[#1E2A6B] focus:ring-[#1E2A6B]"
                        />
                        No
                      </label>
                    </>
                  )}
                />
              </div>
            </div>

            {/* Lender Selection */}
            {!allLenderEnabled && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold text-slate-700">Lender Name *</Label>
                <Controller
                  name="lenders"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={lenderOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val ? Array.from(val) : [])}
                      placeholder={
                        lendersLoading
                          ? "Loading lenders..."
                          : activeLoanTypeIds.length === 0
                            ? "Select Loan Type first"
                            : "Select Lenders"
                      }
                      isSearchable
                      isDisabled={activeLoanTypeIds.length === 0 || lendersLoading}
                      className="text-sm"
                    />
                  )}
                />
                {errors.lenders && (
                  <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.lenders.message}
                  </p>
                )}
              </div>
            )}

            {/* Sourcing Territory */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Sourcing Territory *</Label>
              <Controller
                name="sourcingTerritory"
                control={control}
                render={({ field }) => (
                  <Select
                    options={SOURCING_TERRITORY_OPTIONS}
                    value={SOURCING_TERRITORY_OPTIONS.find((o) => o?.value === field.value) || null}
                    onChange={(val) => field.onChange(val?.value ?? "")}
                    placeholder="Select"
                    className="text-sm"
                  />
                )}
              />
              {errors.sourcingTerritory && (
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.sourcingTerritory.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Status *</Label>
              <div className="flex items-center gap-6 pt-1">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (

                    <>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <Input
                          type="radio"
                          name="status"
                          checked={Number(field.value) === 1}
                          onChange={() => field.onChange(1)}
                          className="h-4 w-4 text-[#1E2A6B]"
                        />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <Input
                          type="radio"
                          name="status"
                          checked={Number(field.value) === -1}
                          onChange={() => field.onChange(-1)}
                          className="h-4 w-4 text-[#1E2A6B]"
                        />
                        In-Active
                      </label>
                    </>
                  )}
                />
              </div>
              {errors.status && (
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1E2A6B] hover:bg-[#1E2A6B]/90 text-white">
              {index !== null ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// View Territory Modal Component
// ---------------------------------------------------------------------------

interface ViewTerritoryModalProps {
  open: boolean;
  onClose: () => void;
  data: TerritoryLoanMapEntry | null;
}

function ViewTerritoryModal({ open, onClose, data }: ViewTerritoryModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Operating Territory Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <DetailRow label="Territory Type" value={data?.territory_type_name ?? ""} />
          <DetailRow label="Territory" value={data?.territory_name ?? ""} />
          <DetailRow
            label="Loan Types"
            value={data?.loan_types?.map((lt) => lt?.loan_type_name ?? "").join(", ") || "None"}
          />
          <DetailRow
            label="Lenders"
            value={
              data?.all_lender_enabled
                ? "All Lenders"
                : data?.lenders?.map((l) => l?.lender_name ?? "").join(", ") || "None"
            }
          />
          <DetailRow
            label="Sourcing Territory"
            value={
              SOURCING_TERRITORY_OPTIONS.find((o) => o?.value === data?.sourcing_territory)?.label ??
              (data?.sourcing_territory ?? "")
            }
          />
          <DetailRow
            label="Status"
            value={
              data?.status === 1 ? (
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50">
                  Inactive
                </Badge>
              )
            }
          />
        </div>


        <div className="flex justify-end border-t border-slate-100 pt-4 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm border-b border-slate-50 last:border-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-center text-slate-400">:</span>
      <span className="text-slate-800 font-medium text-right sm:text-left">{value}</span>
    </div>
  );
}
