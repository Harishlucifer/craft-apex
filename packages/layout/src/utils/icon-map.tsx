import "remixicon/fonts/remixicon.css";

/* ------------------------------------------------------------------ */
/*  Remix Icon component                                               */
/*                                                                      */
/*  The API returns icon names like "ri-store-2-line". Since we now     */
/*  use the Remix Icon font, we can render them directly as <i> tags.   */
/* ------------------------------------------------------------------ */

interface RemixIconProps {
  name: string;
  className?: string;
}

/**
 * Render a Remix Icon by its class name.
 * Usage: <RemixIcon name="ri-store-2-line" />
 */
export function RemixIcon({ name, className = "" }: RemixIconProps) {
  return <i className={`${name} ${className}`} />;
}

/**
 * Get a Remix Icon React element for a given icon name string from the API.
 * Falls back to a dashboard icon if no name is provided.
 */
export function getIconForName(
  iconName?: string,
  size: string = "text-lg"
): React.ReactNode {
  const name = iconName || "ri-dashboard-line";
  return <RemixIcon name={name} className={size} />;
}
