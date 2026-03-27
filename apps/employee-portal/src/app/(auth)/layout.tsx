export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login pages render WITHOUT the sidebar layout
  return <>{children}</>;
}
