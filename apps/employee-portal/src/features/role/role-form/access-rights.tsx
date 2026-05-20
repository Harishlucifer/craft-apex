import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, KeySquare } from "lucide-react";
import {
  Button,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@craft-apex/ui";
import type {
  AllowedPermission,
  ModuleSystemNode,
  RoleData,
} from "./role-form.types";

const NAVY = "#1E2A6B";
const BLUE = "#4C7DF0";

// Legacy AccessRights.processModule + updateParentMappings, ported faithfully.
function findByCode(
  modules: ModuleSystemNode[],
  code: string
): ModuleSystemNode | null {
  for (const m of modules) {
    if (m.code === code) return m;
    if (m.child_module) {
      const c = findByCode(m.child_module, code);
      if (c) return c;
    }
  }
  return null;
}

function processModule(
  module: ModuleSystemNode,
  checkbox: "YES" | "NO",
  permission = ""
): void {
  if (module.allowed_permission) {
    const ap = module.allowed_permission;
    for (const key of Object.keys(ap)) {
      if (permission && permission !== key) continue;
      const cur = ap[key];
      if (typeof cur === "boolean") ap[key] = checkbox === "YES";
      else if (permission === key) ap[key] = checkbox;
    }
  }
  if (module.child_module?.length) {
    for (const child of module.child_module) {
      if (permission === "") child.mapped = checkbox;
      processModule(child, checkbox, permission);
    }
  }
}

function updateParentMappings(modules: ModuleSystemNode[]): boolean {
  let anyMapped = false;
  for (const module of modules) {
    let isMapped = module.mapped === "YES";
    if (module.allowed_permission) {
      isMapped = Object.values(module.allowed_permission).some((v) => {
        if (typeof v === "string") return v !== "";
        return v === true;
      });
    }
    if (module.child_module?.length) {
      isMapped = updateParentMappings(module.child_module) || isMapped;
    }
    module.mapped = isMapped ? "YES" : "NO";
    if (isMapped) anyMapped = true;
  }
  return anyMapped;
}

const isPermActive = (v: AllowedPermission[string]): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v !== "" && v.toUpperCase() === "YES";
  return false;
};

/* — Visual primitives — */

function Switch({
  label,
  checked,
  onChange,
}: {
  label?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "" : "bg-slate-300"
        )}
        style={checked ? { backgroundColor: NAVY } : undefined}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

/* — Browser row — */

function ModuleRow({
  module,
  depth,
  selectedCode,
  onSelect,
  onToggleMapped,
}: {
  module: ModuleSystemNode;
  depth: number;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onToggleMapped: (code: string, next: "YES" | "NO") => void;
}) {
  const hasChildren = (module.child_module?.length ?? 0) > 0;
  const isMapped = module.mapped === "YES";
  const isSelected = selectedCode === module.code;
  const [open, setOpen] = useState(depth === 0 || isSelected);

  // Auto-expand the branch containing the selected node.
  useEffect(() => {
    if (
      hasChildren &&
      module.child_module &&
      selectedCode &&
      findByCode(module.child_module, selectedCode)
    ) {
      setOpen(true);
    }
  }, [selectedCode, hasChildren, module.child_module]);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm transition",
          isSelected ? "font-semibold" : "text-slate-700 hover:bg-slate-50"
        )}
        style={{
          paddingLeft: 6 + depth * 14,
          ...(isSelected
            ? { backgroundColor: `${BLUE}1F`, color: NAVY }
            : undefined),
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-slate-700"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="inline-block h-5 w-5" />
        )}
        <input
          type="checkbox"
          checked={isMapped}
          onChange={(e) =>
            onToggleMapped(module.code, e.target.checked ? "YES" : "NO")
          }
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 accent-[#4C7DF0]"
        />
        <button
          type="button"
          onClick={() => onSelect(module.code)}
          className="flex-1 truncate text-left"
        >
          {module.name}
        </button>
      </div>
      {hasChildren && open && (
        <div>
          {module.child_module!.map((c) => (
            <ModuleRow
              key={c.code}
              module={c}
              depth={depth + 1}
              selectedCode={selectedCode}
              onSelect={onSelect}
              onToggleMapped={onToggleMapped}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* — Editor — */

function StatusBadge({ mapped }: { mapped: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        mapped
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          mapped ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
      {mapped ? "Enabled" : "Disabled"}
    </span>
  );
}

function ModeButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-transparent text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      )}
      style={active ? { backgroundColor: NAVY } : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

function ModuleEditor({
  module,
  onToggleMapped,
  onTogglePerm,
  onSetDisplayMode,
  onBulk,
}: {
  module: ModuleSystemNode;
  onToggleMapped: (code: string, next: "YES" | "NO") => void;
  onTogglePerm: (code: string, perm: string, next: "YES" | "NO") => void;
  onSetDisplayMode: (code: string, next: string) => void;
  onBulk: (code: string, next: "YES" | "NO") => void;
}) {
  const isMapped = module.mapped === "YES";
  const perms = Object.entries(module.allowed_permission ?? {});
  const booleans = perms.filter(([, v]) => typeof v === "boolean");
  const strings = perms.filter(([, v]) => typeof v === "string");
  const mode = (module.display_mode ?? "SHOW") as "SHOW" | "HIDE";

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-slate-400">{module.code}</p>
          <h3 className="truncate text-lg font-bold text-slate-900">
            {module.name}
          </h3>
        </div>
        <StatusBadge mapped={isMapped} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-slate-100 py-3">
        <Switch
          label="Enable module"
          checked={isMapped}
          onChange={(v) => onToggleMapped(module.code, v ? "YES" : "NO")}
        />
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBulk(module.code, "YES")}
          >
            Grant all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBulk(module.code, "NO")}
          >
            Clear all
          </Button>
        </span>
      </div>

      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Display mode
        </Label>
        <div className="flex flex-wrap gap-2">
          <ModeButton
            active={mode === "SHOW"}
            onClick={() => onSetDisplayMode(module.code, "SHOW")}
            icon={<Eye className="h-3.5 w-3.5" />}
          >
            Show in menu
          </ModeButton>
          <ModeButton
            active={mode === "HIDE"}
            onClick={() => onSetDisplayMode(module.code, "HIDE")}
            icon={<EyeOff className="h-3.5 w-3.5" />}
          >
            Hidden
          </ModeButton>
        </div>
      </div>

      {booleans.length > 0 && (
        <div>
          <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Permissions
          </Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {booleans.map(([k, v]) => {
              const active = isPermActive(v as AllowedPermission[string]);
              return (
                <div
                  key={k}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition",
                    active
                      ? "border-[#4C7DF0]/40 bg-[#4C7DF0]/[0.06]"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <KeySquare
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        active ? "text-[#1E2A6B]" : "text-slate-400"
                      )}
                    />
                    <span className="truncate text-sm text-slate-700">{k}</span>
                  </span>
                  <Switch
                    checked={active}
                    onChange={(nv) =>
                      onTogglePerm(module.code, k, nv ? "YES" : "NO")
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {strings.length > 0 && (
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Other settings
          </Label>
          <ul className="space-y-1 text-xs text-slate-600">
            {strings.map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="font-medium text-slate-700">{k}</span>
                <span className="text-slate-400">·</span>
                <span>{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {booleans.length === 0 && strings.length === 0 && (
        <p className="text-sm text-slate-400">
          This module has no permission keys.
        </p>
      )}
    </div>
  );
}

/* — Top-level — */

function countMapped(modules: ModuleSystemNode[]): {
  mapped: number;
  total: number;
} {
  let mapped = 0;
  let total = 0;
  const walk = (list: ModuleSystemNode[]) => {
    for (const m of list) {
      total += 1;
      if (m.mapped === "YES") mapped += 1;
      if (m.child_module?.length) walk(m.child_module);
    }
  };
  walk(modules);
  return { mapped, total };
}

export interface AccessRightsProps {
  role: RoleData;
  onChange: (next: RoleData) => void;
  onSave: () => void;
  onBack: () => void;
  saving: boolean;
}

export function AccessRights({
  role,
  onChange,
  onSave,
  onBack,
  saving,
}: AccessRightsProps) {
  const systems = role.systems ?? {};
  const systemKeys = useMemo(() => Object.keys(systems), [systems]);
  const [activeSystem, setActiveSystem] = useState<string | undefined>(
    systemKeys[0]
  );
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Reset selection when the system tab changes.
  useEffect(() => {
    setSelectedCode(null);
  }, [activeSystem]);

  if (systemKeys.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No access-rights tree returned for this role. Save the basic details
        first; the tree will appear after the role is created.
      </div>
    );
  }

  const active = activeSystem ? systems[activeSystem] : undefined;
  const selectedModule =
    active && selectedCode ? findByCode(active, selectedCode) : null;
  const counts = active ? countMapped(active) : { mapped: 0, total: 0 };

  const apply = (code: string, next: "YES" | "NO", permission = "") => {
    if (!activeSystem) return;
    const _role: RoleData = structuredClone(role);
    const data = _role.systems?.[activeSystem];
    if (!data) return;
    const target = findByCode(data, code);
    if (!target) return;
    if (permission === "") target.mapped = next;
    processModule(target, next, permission);
    updateParentMappings(data);
    onChange(_role);
  };

  const setDisplayMode = (code: string, next: string) => {
    if (!activeSystem) return;
    const _role: RoleData = structuredClone(role);
    const data = _role.systems?.[activeSystem];
    if (!data) return;
    const target = findByCode(data, code);
    if (!target) return;
    target.display_mode = next;
    onChange(_role);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeSystem} onValueChange={(v) => setActiveSystem(v)}>
          <TabsList>
            {systemKeys.map((k) => (
              <TabsTrigger key={k} value={k}>
                {k}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="text-xs font-medium text-slate-500">
          {counts.mapped}/{counts.total} modules enabled
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Browser */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="max-h-[60vh] overflow-y-auto p-1">
            {active?.length ? (
              active.map((m) => (
                <ModuleRow
                  key={m.code}
                  module={m}
                  depth={0}
                  selectedCode={selectedCode}
                  onSelect={setSelectedCode}
                  onToggleMapped={(c, v) => apply(c, v)}
                />
              ))
            ) : (
              <div className="p-4 text-sm text-slate-500">
                No modules in this system.
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        {selectedModule ? (
          <ModuleEditor
            module={selectedModule}
            onToggleMapped={(c, v) => apply(c, v)}
            onTogglePerm={(c, p, v) => apply(c, v, p)}
            onSetDisplayMode={setDisplayMode}
            onBulk={(c, v) => apply(c, v)}
          />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
            <div className="space-y-1">
              <KeySquare className="mx-auto h-8 w-8 text-slate-300" />
              <p className="font-medium text-slate-600">Select a module</p>
              <p className="text-xs">
                Pick a module on the left to edit its access and permissions.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save Access Rights"}
        </Button>
      </div>
    </div>
  );
}
