/* App route group layout – wraps content with the portal layout (sidebar) */

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add PartnerLayout wrapper when created
  return <>{children}</>;
}
