"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { waLink } from "@/lib/whatsapp";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/find-my-order", label: "Find my order" },
  { href: "/shop", label: "Shop All" },
  { href: "/collections/sweets", label: "Sweets" },
  { href: "/collections/namkeen", label: "Namkeen" },
  { href: "/shop?tag=best-seller", label: "Best Sellers" },
  { href: "/bulk-orders", label: "Bulk Orders" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const router = useRouter();
  const { count, setOpen } = useCart();
  const { customer } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");


  









  function submitSearch(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();
    const query = q.trim();
    setMenuOpen(false);
    document.body.style.overflow = "";
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }


  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream-50/95 backdrop-blur supports-[backdrop-filter]:bg-cream-50/80">
      <Container>
        <div className="flex h-16 items-center gap-3 lg:h-20">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "hidden";
              setMenuOpen(true);
            }}

            aria-label="Open menu"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-800/5 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="Bhaktanjaneya Sweets"
              width={48}
              height={48}
              priority
              className="h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12"
            />
            <span className="font-serif text-lg font-bold leading-none text-maroon-900 sm:text-xl">
              Bhaktanjaneya
              <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-saffron-600">
                Sweets
              </span>
            </span>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={submitSearch}
            className="relative ml-6 hidden flex-1 lg:block"
          >
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sweets, namkeen, gifts…"
              className="h-11 w-full rounded-full border border-cream-300 bg-cream-100/60 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
            />
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <a
              href={waLink(`Hello ${config.businessName}! I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1fb457] md:inline-flex"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <Link
              href={customer ? "/account" : "/login"}
              className="flex h-10 items-center gap-2 rounded-full px-2.5 text-maroon-800 hover:bg-maroon-800/5 sm:px-3"
            >
              <User size={20} />
              <span className="hidden text-sm font-medium sm:inline">
                {customer ? customer.name?.split(" ")[0] ?? "Account" : "Login / Sign up"}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-800/5"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron-500 px-1 text-[11px] font-bold text-maroon-900">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden h-12 items-center gap-7 border-t border-cream-300/50 text-sm font-medium text-maroon-800 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="relative transition-colors hover:text-saffron-600"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* prevent background scroll while menu is open */}



          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => {
              document.body.style.overflow = "";
              setMenuOpen(false);
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-cream-50 shadow-card">

            <div className="flex items-center justify-between border-b border-cream-300 px-4 py-4">
              <span className="font-serif text-lg font-bold text-maroon-900">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-800/5"
              >
                <X size={22} />
              </button>
            </div>

            <div className="border-b border-cream-300 p-4">
              <form onSubmit={submitSearch} className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="h-11 w-full rounded-full border border-cream-300 bg-cream-100/60 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
                />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-maroon-900 hover:bg-maroon-800/5"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-cream-300 p-4">
              <Link
                href={customer ? "/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-maroon-800"
              >
                <User size={18} />
                {customer ? "My Account" : "Login / Sign up"}
              </Link>
              <a
                href={waLink(`Hello ${config.businessName}! I have a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white",
                )}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
