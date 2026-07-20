import { useMemo, useState } from "react";
import Select from "react-select";
import { Plus, Trash2, Eye, Edit2, Users } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  toast,
} from "@craft-apex/ui";
import type { EmployeeRow, TerritoryLoanMapEntry } from "./rm-mapping.types";

interface RMPanelProps {
  selectedRmList: string[];
  setSelectedRmList: (val: string[]) => void;
  syncParentValues: (
    updatedTerritories: TerritoryLoanMapEntry[],
    updatedRms: string[],
    updatedCategory: string,
    updatedOnbTerritoryId: string
  ) => void;
  territoryMapping: TerritoryLoanMapEntry[];
  partnerCategory: string;
  onboardingTerritoryId: string;
  allAvailableEmployees: EmployeeRow[];
}

export function RMPanel({
  selectedRmList,
  setSelectedRmList,
  syncParentValues,
  territoryMapping,
  partnerCategory,
  onboardingTerritoryId,
  allAvailableEmployees,
}: RMPanelProps) {
  const [rmModalOpen, setRmModalOpen] = useState(false);

  const handleAddRMClick = () => {
    setRmModalOpen(true);
  };

  const handleDeleteRMClick = (userId: string) => {
    const updated = selectedRmList.filter((uid) => uid !== userId);
    setSelectedRmList(updated);
    syncParentValues(territoryMapping, updated, partnerCategory, onboardingTerritoryId);
    toast.success("Relationship manager mapping removed");
  };

  // Resolve display names for mapped relationship managers
  const resolvedRMs = useMemo(() => {
    return selectedRmList.map((userId) => {
      const found = allAvailableEmployees.find((emp) => String(emp?.user_id) === String(userId));
      return {
        user_id: userId,
        name: found?.name ?? `Employee (ID: ${userId})`,
      };
    });
  }, [selectedRmList, allAvailableEmployees]);


  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 px-1">
        <Users className="h-5 w-5 text-[#1E2A6B]" /> Relationship Manager Mapping
      </h3>
      <div className="flex flex-wrap gap-4">
        {resolvedRMs.map((rm) => (
          <div
            key={rm.user_id}
            className="relative overflow-hidden w-[280px] h-[160px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <p className="text-sm text-slate-700">
                <span className="font-bold text-slate-800">RM Name:</span> {rm.name}
              </p>
            </div>
            <div className="flex items-center gap-4 justify-start pt-1">
              <button
                type="button"
                onClick={handleAddRMClick}
                className="text-slate-400 hover:text-[#1E2A6B] transition-colors p-1"
                title="View RM Options"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleAddRMClick}
                className="text-slate-400 hover:text-[#1E2A6B] transition-colors p-1"
                title="Edit RM Selection"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRMClick(rm.user_id)}
                className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                title="Remove RM"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        ))}

        {/* Add RM Card */}
        <div className="w-[280px] h-[160px] rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
          <Button
            type="button"
            onClick={handleAddRMClick}
            className="bg-[#1E2A6B] hover:bg-[#1E2A6B]/90 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add RM
          </Button>
        </div>
      </div>

      {/* Add/Edit RM Mapping Modal */}
      {rmModalOpen && (
        <RMModal
          open={rmModalOpen}
          onClose={() => setRmModalOpen(false)}
          availableEmployees={allAvailableEmployees}
          selectedRmIds={selectedRmList}
          onSave={(ids) => {
            setSelectedRmList(ids);
            syncParentValues(territoryMapping, ids, partnerCategory, onboardingTerritoryId);
            setRmModalOpen(false);
            toast.success("Relationship manager mapping updated");
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add/Edit RM Modal Component
// ---------------------------------------------------------------------------

interface RMModalProps {
  open: boolean;
  onClose: () => void;
  availableEmployees: any[];
  selectedRmIds: string[];
  onSave: (ids: string[]) => void;
}

function RMModal({ open, onClose, availableEmployees, selectedRmIds, onSave }: RMModalProps) {
  const rmOptions = useMemo(() => {
    return availableEmployees.map((emp) => ({
      value: String(emp?.user_id ?? ""),
      label: emp?.name ?? "",
    }));
  }, [availableEmployees]);


  const [selectedInModal, setSelectedInModal] = useState<string[]>(selectedRmIds);

  const handleSave = () => {
    if (selectedInModal.length === 0) {
      toast.error("Please select at least one Relationship Manager");
      return;
    }
    onSave(selectedInModal);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Configure Relationship Managers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4 min-h-[180px] flex flex-col justify-between">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">RM Name *</Label>
            <Select
              isMulti

              options={rmOptions}
              value={rmOptions.filter((o) => selectedInModal.includes(o.value))}
              onChange={(val) => {
                const ids = val ? val.map((o) => o.value) : [];
                setSelectedInModal(ids);
              }}
              placeholder="Search and select Relationship Managers"
              isSearchable
              className="text-sm"
              classNamePrefix="react-select"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#1E2A6B] hover:bg-[#1E2A6B]/90 text-white"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
