"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "bas_cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Hydration: intentionally setting state from localStorage
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.variantId === item.variantId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
    setOpen(true);
  }, []);

  const remove = useCallback(
    (variantId: string) =>
      setItems((prev) => prev.filter((x) => x.variantId !== variantId)),
    [],
  );

  const setQty = useCallback(
    (variantId: string, qty: number) =>
      setItems((prev) =>
        prev.map((x) =>
          x.variantId === variantId ? { ...x, quantity: Math.max(1, qty) } : x,
        ),
      ),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((s, x) => s + x.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((s, x) => s + x.price * x.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, count, subtotal, add, remove, setQty, clear, isOpen, setOpen }),
    [items, count, subtotal, add, remove, setQty, clear, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
