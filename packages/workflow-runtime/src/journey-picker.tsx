import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@craft-apex/ui";
import { Check } from "lucide-react";
import { useJourneyTypes } from "./workflow-runtime.api";
import type { JourneyType } from "./workflow-runtime.types";

interface Props {
  open: boolean;
  workflowType: string;
  partnerType?: string;
  onCancel: () => void;
  onPick: (journey: JourneyType) => void;
}

export function JourneyPicker({
  open,
  workflowType,
  partnerType,
  onCancel,
  onPick,
}: Props) {
  const { data: groups = {}, isFetching } = useJourneyTypes(
    workflowType,
    partnerType
  );
  const [selected, setSelected] = useState<JourneyType | null>(null);

  // Legacy uses the first group; we display all groups but the first one is
  // typically the only one populated.
  const journeys = useMemo<JourneyType[]>(() => {
    const keys = Object.keys(groups);
    if (keys.length === 0) return [];
    const first = groups[keys[0]!];
    return Array.isArray(first) ? first : [];
  }, [groups]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select journey</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {isFetching ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : journeys.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center text-sm text-slate-500">
              No journeys available for this workflow type.
            </p>
          ) : (
            <ul className="space-y-2">
              {journeys.map((j) => {
                const active = selected?.code === j.code;
                return (
                  <li key={j.code}>
                    <button
                      type="button"
                      onClick={() => setSelected(j)}
                      className={
                        active
                          ? "flex w-full items-center justify-between rounded-md border-2 border-[#4C7DF0] bg-[#4C7DF0]/5 p-3 text-left"
                          : "flex w-full items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-left hover:border-slate-300"
                      }
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {j.name ?? j.code}
                        </p>
                        {j.description && (
                          <p className="text-xs text-slate-500">
                            {j.description}
                          </p>
                        )}
                      </div>
                      {active && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4C7DF0] text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selected}
              onClick={() => selected && onPick(selected)}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
