import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This nested /admin/admin layout is intentionally passthrough.
  // The outer /app/(admin)/layout.tsx handles the sidebar/header and login page bypass.
  return <>{children}</>;
}
