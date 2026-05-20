/** Backend-driven module node (parent → child → grandchild). */
export interface ModuleNode {
  code: string;
  name: string;
  url?: string;
  icon?: string;
  /** legacy: only nodes with display_mode === "SHOW" appear in the menu */
  display_mode?: string;
  /** anchor target, passed through from the module tree */
  target?: string;
  map_id?: string;
  allowed_permission?: Record<string, boolean>;
  configuration?: Record<string, unknown>;
  child_module?: ModuleNode[];
}

export interface ResolvedModule {
  node: ModuleNode;
  /** ancestor names, root-first, for breadcrumbs */
  trail: string[];
}
