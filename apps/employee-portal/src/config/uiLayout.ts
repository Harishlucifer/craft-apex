// Centralized UI layout configuration for the employee portal
// Adjust values here to change navigation direction or layout type app-wide.

export type UILayoutDirection = "horizontal" | "vertical";
export type UILayoutType = "SINGLE_COLUMN_LAYOUT" | "TWO_COLUMN_LAYOUT";

interface UILayoutConfig {
  direction: UILayoutDirection;
  layoutType: UILayoutType;
}

// Maintain current functionality: vertical direction + two-column layout.
export const uiLayoutConfig: UILayoutConfig = {
  direction: "vertical",
  layoutType: "TWO_COLUMN_LAYOUT",
};

export default uiLayoutConfig;