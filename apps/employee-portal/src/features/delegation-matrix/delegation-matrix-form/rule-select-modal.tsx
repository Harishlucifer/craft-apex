import { useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  Badge,
} from "@craft-apex/ui";
import { useRuleList } from "@/features/rule/rule-list/rule-list.api";
import type { RuleRow } from "@/features/rule/rule-list/rule-list.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (rule: RuleRow) => void;
}

export function RuleSelectModal({ open, onClose, onSelect }: Props) {
  const { data: rules = [], isFetching } = useRuleList();
  const [search, setSearch] = useState("");

  const filtered = rules.filter((r) =>
    [r.code, r.name].some((v) =>
      String(v ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Select Rule</DialogTitle>
        </DialogHeader>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="h-10 rounded-full bg-slate-50 ps-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-slate-100 rounded-lg">
          {isFetching && rules.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              Loading rules...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              No rules found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono text-xs">{r.code}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.name}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={r.status === 1 ? "success" : "destructive"}>
                        {r.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelect(r);
                          onClose();
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
