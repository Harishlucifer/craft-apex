import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@craft-apex/ui";
import {
  registerStepComponent,
  type StepComponentProps,
} from "@craft-apex/workflow-runtime";
import {
  useTenantSetup,
  useLookupPartnerCategory,
  useTerritoryTypes,
  useTerritories,
  useLoanTypes,
  useRelationshipManagers,
} from "./rm-mapping.api";
import type { TerritoryLoanMapEntry } from "./rm-mapping.types";
import { TerritoryPanel } from "./territory-panel";
import { RMPanel } from "./rm-panel";

// Helper to parse channel territories from flat form values
function parseChannelTerritories(value: Record<string, unknown>): TerritoryLoanMapEntry[] {
  if (Array.isArray(value.channel_territories)) {
    return value.channel_territories as TerritoryLoanMapEntry[];
  }

  const list: TerritoryLoanMapEntry[] = [];
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith("channel_territories[")) {
      // 1. Handle nested array objects: channel_territories[0].loan_types[0].loan_type_id
      const nestedMatch = key.match(/^channel_territories\[(\d+)\]\.(\w+)\[(\d+)\]\.(\w+)$/);
      if (nestedMatch) {
        const indexStr = nestedMatch[1];
        const arrayKey = nestedMatch[2];
        const childIndexStr = nestedMatch[3];
        const childField = nestedMatch[4];

        if (indexStr && arrayKey && childIndexStr && childField) {
          const index = parseInt(indexStr, 10);
          const childIndex = parseInt(childIndexStr, 10);

          if (!list[index]) {
            list[index] = {
              all_lender_enabled: true,
              territory_type_name: "",
              territory_type_id: "",
              territory_name: "",
              territory_id: "",
              sourcing_territory: "",
              status: 1,
              loan_type_ids: [],
              loan_types: [],
              lenders: [],
              lender_ids: [],
            };
          }

          if (arrayKey === "loan_types") {
            if (!list[index].loan_types) list[index].loan_types = [];
            if (!list[index].loan_types[childIndex]) {
              list[index].loan_types[childIndex] = { loan_type_id: "", loan_type_name: "" };
            }
            (list[index].loan_types[childIndex] as any)[childField] = String(val);
          } else if (arrayKey === "lenders") {
            if (!list[index].lenders) list[index].lenders = [];
            if (!list[index].lenders[childIndex]) {
              list[index].lenders[childIndex] = { lender_id: "", lender_name: "" };
            }
            (list[index].lenders[childIndex] as any)[childField] = String(val);
          }
        }
        continue;
      }


      // 2. Handle flat properties: channel_territories[0].territory_id
      const match = key.match(/^channel_territories\[(\d+)\]\.(.+)$/);
      if (match && match[1] && match[2]) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!list[index]) {
          list[index] = {
            all_lender_enabled: true,
            territory_type_name: "",
            territory_type_id: "",
            territory_name: "",
            territory_id: "",
            sourcing_territory: "",
            status: 1,
            loan_type_ids: [],
            loan_types: [],
            lenders: [],
            lender_ids: [],
          };
        }

        if (field === "all_lender_enabled") {
          list[index].all_lender_enabled = val === true || val === "true";
        } else if (field === "status") {
          list[index].status = Number(val);
        } else if (field === "loan_type_ids") {
          list[index].loan_type_ids = Array.isArray(val) ? (val as string[]) : [];
        } else if (field === "lender_ids") {
          list[index].lender_ids = Array.isArray(val) ? (val as string[]) : [];
        } else if (field === "loan_types") {
          list[index].loan_types = Array.isArray(val) ? val : [];
        } else if (field === "lenders") {
          list[index].lenders = Array.isArray(val) ? val : [];
        } else {
          (list[index] as any)[field] = val;
        }
      }
    }
  }
  return list.filter(Boolean);
}

// Helper to parse relationship managers from flat form values
function parseRelationshipManagers(value: Record<string, unknown>): string[] {
  if (Array.isArray(value.relationship_managers)) {
    return value.relationship_managers as string[];
  }

  const list: string[] = [];
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith("relationship_managers[")) {
      const match = key.match(/^relationship_managers\[(\d+)\]$/);
      if (match && match[1]) {
        const index = parseInt(match[1], 10);
        list[index] = String(val);
      }
    }
  }
  return list.length > 0 ? list.filter(Boolean) : [];
}

export function RMMappingStep({ value, onChange, context }: StepComponentProps) {
  const sourceId = context?.sourceId;

  // 1. API Calls
  const { data: tenantSetup } = useTenantSetup();
  const territoryEnabled = tenantSetup?.tenant?.TERRITORY_ENABLED === "YES";
  const partnerManagerRoleCode = tenantSetup?.tenant?.PARTNER_MANAGER_ROLE_CODE;

  const { data: partnerCategories = [] } = useLookupPartnerCategory();
  const { data: territoryTypes = [] } = useTerritoryTypes();
  const { data: territories = [] } = useTerritories();
  const { data: loanTypes = [] } = useLoanTypes();
  const { data: allAvailableEmployees = [] } = useRelationshipManagers(partnerManagerRoleCode);

  // 2. States for local lists
  const [territoryMapping, setTerritoryMapping] = useState<TerritoryLoanMapEntry[]>([]);
  const [selectedRmList, setSelectedRmList] = useState<string[]>([]);
  const [partnerCategory, setPartnerCategory] = useState<string>("");
  const [onboardingTerritoryId, setOnboardingTerritoryId] = useState<string>("");
  const [onboardingTerritoryTypeId, setOnboardingTerritoryTypeId] = useState<string>("");

  // 3. Initialize states from parent form values on load or sourceId change
  useEffect(() => {
    setTerritoryMapping(parseChannelTerritories(value));
    setSelectedRmList(parseRelationshipManagers(value));
    setPartnerCategory(String(value["application.category"] ?? ""));
    setOnboardingTerritoryId(String(value["application.onboarding_territory_id"] ?? ""));
  }, [sourceId, value]);

  // Derive onboarding territory type if territory id is set
  useEffect(() => {
    if (onboardingTerritoryId && territories.length > 0) {
      const found = territories.find(
        (t) => String(t.territory_id) === String(onboardingTerritoryId)
      );
      if (found) {
        setOnboardingTerritoryTypeId(String(found.territory_type_id));
      }
    }
  }, [onboardingTerritoryId, territories]);

  // Helper to sync local state back to parent state
  const syncParentValues = (
    updatedTerritories: TerritoryLoanMapEntry[],
    updatedRms: string[],
    updatedCategory: string,
    updatedOnbTerritoryId: string
  ) => {
    const nextValues = { ...value };

    // Clear old flat representation keys
    for (const key of Object.keys(nextValues)) {
      if (
        key.startsWith("channel_territories[") ||
        key.startsWith("relationship_managers[")
      ) {
        delete nextValues[key];
      }
    }

    nextValues.channel_territories = updatedTerritories;
    nextValues.relationship_managers = updatedRms;
    nextValues["application.category"] = updatedCategory;
    nextValues["application.onboarding_territory_id"] = updatedOnbTerritoryId;

    onChange(nextValues);
  };

  const handlePartnerCategoryChange = (category: string) => {
    setPartnerCategory(category);
    syncParentValues(territoryMapping, selectedRmList, category, onboardingTerritoryId);
  };

  return (
    <div className="space-y-6">
      {/* Category (Partner Type) Selection - Shown if category is not pre-populated */}
      {!value["application.category"] && partnerCategories.length > 0 && (
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CardContent className="space-y-4 p-0">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1E2A6B]" /> Partner Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {partnerCategories.map((cat) => (
                <button
                  key={cat.lu_key}
                  type="button"
                  onClick={() => handlePartnerCategoryChange(cat.lu_key)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                    partnerCategory === cat.lu_key
                      ? "bg-[#1E2A6B] text-white border-[#1E2A6B] shadow-sm scale-105"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.lu_name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Territory mapping panel */}
      <TerritoryPanel
        territoryMapping={territoryMapping}
        setTerritoryMapping={setTerritoryMapping}
        onboardingTerritoryId={onboardingTerritoryId}
        setOnboardingTerritoryId={setOnboardingTerritoryId}
        onboardingTerritoryTypeId={onboardingTerritoryTypeId}
        setOnboardingTerritoryTypeId={setOnboardingTerritoryTypeId}
        partnerCategory={partnerCategory}
        syncParentValues={syncParentValues}
        selectedRmList={selectedRmList}
        territoryEnabled={territoryEnabled}
        territoryTypes={territoryTypes}
        territories={territories}
        loanTypes={loanTypes}
      />

      {/* RM mapping panel */}
      <RMPanel
        selectedRmList={selectedRmList}
        setSelectedRmList={setSelectedRmList}
        syncParentValues={syncParentValues}
        territoryMapping={territoryMapping}
        partnerCategory={partnerCategory}
        onboardingTerritoryId={onboardingTerritoryId}
        allAvailableEmployees={allAvailableEmployees}
      />
    </div>
  );
}

// Register step component globally in the workflow registry
registerStepComponent("RM_MAPPING", RMMappingStep);
