"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  BadgePercent,
  ShoppingBag,
  Users,
  Newspaper,
  LogOut,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/offers", label: "Offers", icon: BadgePercent },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, logout, refreshData } = useAdmin();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-cream-50 lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-cream-200 bg-maroon-900 text-cream-100 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron-400 font-serif text-lg font-bold text-maroon-900">
              B
            </span>
            <div className="leading-tight">
              <p className="font-serif text-sm font-bold text-cream-50">
                {config.businessName}
              </p>
              <p className="text-[11px] text-cream-100/60">Admin panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-cream-50/10 text-saffron-300"
                  : "text-cream-100/80 hover:bg-cream-50/5 hover:text-cream-50",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-cream-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm text-ink-500">
            Signed in as{" "}
            <span className="font-medium text-maroon-900">
              {session?.user.name ?? session?.user.email}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshData}
              title="Refresh Supabase data"
              className="hidden items-center gap-1.5 rounded-lg border border-cream-300 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-cream-100 sm:inline-flex"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-cream-100"
            >
              <ExternalLink size={14} /> View store
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-maroon-800 px-3 py-2 text-xs font-semibold text-cream-50 hover:bg-maroon-700"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
