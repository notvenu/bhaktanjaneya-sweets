"use client";

import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";

function AdminGate({ children }: { children: React.ReactNode }) {
  const { hydrated, session } = useAdmin();
  // Root element must be stable between server and client to avoid
  // hydration mismatches. Render a consistent container, then swap
  // the inner content once hydration/session is known.
  return (
    <div className="min-h-screen bg-cream-50">
      {!hydrated ? null : !session ? <AdminLogin /> : <AdminShell>{children}</AdminShell>}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminGate>{children}</AdminGate>
    </AdminProvider>
  );
}
