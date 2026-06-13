"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { config } from "@/lib/config";
import { formatINR, cn } from "@/lib/utils";
import { defaultProductImage } from "@/lib/images";

export function CartDrawer() {
  const { items, count, subtotal, setQty, remove, isOpen, setOpen } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const remaining = Math.max(0, config.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / config.freeShippingThreshold) * 100);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-ink-900/50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream-50 shadow-card transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <h2 className="font-serif text-lg font-bold text-maroon-900">
            Your Cart{count > 0 && ` (${count})`}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-maroon-800 hover:bg-maroon-800/5"
          >
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-maroon-800">
              <ShoppingBag size={28} />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-maroon-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Add some sweets to get started.
              </p>
            </div>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center rounded-full bg-maroon-800 px-6 text-sm font-semibold text-cream-50 hover:bg-maroon-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Free shipping progress */}
              <div className="mb-4 rounded-xl bg-cream-100 p-3">
                {remaining > 0 ? (
                  <p className="text-xs text-ink-600">
                    Add{" "}
                    <span className="font-semibold text-maroon-800">
                      {formatINR(remaining)}
                    </span>{" "}
                    more for free shipping
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-leaf-600">
                    🎉 You&apos;ve unlocked free shipping!
                  </p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-300">
                  <div
                    className="h-full rounded-full bg-saffron-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-4">
                {items.map((it) => (
                  <li key={it.variantId} className="flex gap-3">
                    <Link
                      href={`/product/${it.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-cream-200 bg-cream-100"
                    >
                      <Image
                        src={it.image || defaultProductImage("sweets")}
                        alt={it.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${it.slug}`}
                          onClick={() => setOpen(false)}
                          className="font-medium leading-snug text-maroon-900 hover:text-saffron-600"
                        >
                          {it.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(it.variantId)}
                          aria-label="Remove item"
                          className="text-ink-400 hover:text-maroon-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-ink-400">{it.variantLabel}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
                          <button
                            type="button"
                            aria-label="Decrease"
                            onClick={() => setQty(it.variantId, it.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-maroon-800 hover:bg-maroon-800/5"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            onClick={() => setQty(it.variantId, it.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-maroon-800 hover:bg-maroon-800/5"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-semibold text-maroon-900">
                          {formatINR(it.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-cream-200 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-600">Subtotal</span>
                <span className="text-lg font-bold text-maroon-900">
                  {formatINR(subtotal)}
                </span>
              </div>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-maroon-800 text-sm font-semibold text-cream-50 hover:bg-maroon-700"
              >
                Checkout <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-maroon-800/30 text-sm font-semibold text-maroon-800 hover:bg-maroon-800/5"
              >
                Continue shopping
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
