import { create } from "zustand";
import { STORAGE_KEYS } from "@craft-apex/api";
import { match } from "path-to-regexp";
import type { ModuleNode, ResolvedModule } from "./types";

function readModules(): ModuleNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.module);
    return raw ? (JSON.parse(raw) as ModuleNode[]) : [];
  } catch {
    return [];
  }
}

const cleanUrl = (url: string) => url.split("?")[0]!.split("#")[0]!;

/** Depth-first path match against the module tree (legacy `withModule` logic). */
export function resolveModule(
  pathname: string,
  modules: ModuleNode[],
  trail: string[] = []
): ResolvedModule | null {
  for (const node of modules) {
    if (node.url) {
      const matcher = match(cleanUrl(node.url), { decode: decodeURIComponent });
      if (matcher(pathname)) return { node, trail };
    }
    if (node.child_module?.length) {
      const found = resolveModule(pathname, node.child_module, [
        ...trail,
        node.name,
      ]);
      if (found) return found;
    }
  }
  return null;
}

export function isRouteAllowed(
  pathname: string,
  modules: ModuleNode[]
): boolean {
  return resolveModule(pathname, modules) != null;
}

interface ModuleState {
  modules: ModuleNode[];
  setModules: (modules: ModuleNode[]) => void;
  hydrate: () => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  modules: readModules(),
  setModules: (modules) => {
    localStorage.setItem(STORAGE_KEYS.module, JSON.stringify(modules));
    set({ modules });
  },
  hydrate: () => set({ modules: readModules() }),
}));
