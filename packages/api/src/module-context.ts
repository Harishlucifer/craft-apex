/**
 * The active module's map id, sent as the `X-Module` header (legacy parity).
 * Set by the layout's module resolver as the route changes.
 */
let currentModuleId: string | null = null;

export function setActiveModuleId(id: string | null) {
  currentModuleId = id;
}

export function getActiveModuleId(): string | null {
  return currentModuleId;
}
