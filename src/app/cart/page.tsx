"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  CreditCard,
  Tag,
  ShoppingBag,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getActiveOffers } from "@/lib/api/offers";
import { createRazorpayOrder } from "@/lib/api/payments";
import { createOrder } from "@/lib/api/orders";
import { waLink, cartOrderMessage } from "@/lib/whatsapp";
import { config } from "@/lib/config";
import { formatINR, uid } from "@/lib/utils";
import type { Offer, Order } from "@/lib/types";

function discountFor(offer: Offer | null, subtotal: number): number {
  if (!offer) return 0;
  if (offer.minSubtotal && subtotal < offer.minSubtotal) return 0;
  if (offer.type === "percent")
    return Math.round((subtotal * offer.value) / 100);
  if (offer.type === "flat") return Math.min(subtotal, offer.value);
  return 0;
}

export default function CartPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const { customer } = useAuth();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [code, setCode] = useState("");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [codeError, setCodeError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [payNote, setPayNote] = useState("");
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    getActiveOffers().then(setOffers).catch(() => setOffers([]));
  }, []);

  const discount = useMemo(() => discountFor(offer, subtotal), [offer, subtotal]);
  const freeShipping =
    subtotal >= config.freeShippingThreshold ||
    (offer?.type === "free_shipping" &&
      (!offer.minSubtotal || subtotal >= offer.minSubtotal));
  const total = Math.max(0, subtotal - discount);

  function applyCode() {
    setCodeError("");
    const found = offers.find(
      (o) => o.code.toLowerCase() === code.trim().toLowerCase(),
    );
    if (!found) {
      setOffer(null);
      setCodeError("That code isn't valid.");
      return;
    }
    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setOffer(null);
      setCodeError(
        `Add ${formatINR(found.minSubtotal - subtotal)} more to use ${found.code}.`,
      );
      return;
    }
    setOffer(found);
  }

  function buildOrder(): Order {
    return {
      id: uid("ord"),
      customerPhone: phone.replace(/[^0-9]/g, ""),
      customerName: name || undefined,
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        variantLabel: it.variantLabel,
        price: it.price,
        quantity: it.quantity,
      })),
      subtotal,
      discount: discount || undefined,
      shipping: freeShipping ? 0 : undefined,
      total,
      channel: "whatsapp",
      paymentStatus: "pending",
      status: "new",
      createdAt: new Date().toISOString(),
    };
  }

  function placeWhatsAppOrder() {
    setFormError("");
    const digits = phone.replace(/[^0-9]/g, "");
    if (digits.length < 10) {
      setFormError("Please enter a valid phone number so we can confirm your order.");
      return;
    }
    createOrder(buildOrder())
      .then(() => {
        const msg = cartOrderMessage(items, { name, phone: digits, subtotal: total });
        window.open(waLink(msg), "_blank", "noopener,noreferrer");
        clear();
        setPlaced(true);
      })
      .catch((error) => {
        setFormError(error instanceof Error ? error.message : "Could not create order.");
      });
  }

  async function payOnline() {
    setPayNote("");
    try {
      // Phase 2: backend creates the Razorpay order, then we open Checkout with
      // the returned order id + keyId and verify the signature server-side.
      await createRazorpayOrder(total);
      // (Razorpay Checkout would open here once the backend is connected.)
    } catch (e) {
      setPayNote(
        e instanceof Error
          ? e.message
          : "Online payment isn't available yet. Please order on WhatsApp.",
      );
    }
  }

  if (placed) {
    return (
      <Container>
        <div className="mx-auto max-w-lg py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-600/12 text-leaf-600">
            <Check size={32} />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-maroon-900">
            Almost done!
          </h1>
          <p className="mt-2 text-ink-600">
            We&apos;ve opened WhatsApp with your order details. Just hit send and
            we&apos;ll confirm availability, total, and delivery with you.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full bg-maroon-800 px-6 text-sm font-semibold text-cream-50 hover:bg-maroon-700"
            >
              Continue shopping
            </Link>
            {customer && (
              <Link
                href="/account"
                className="inline-flex h-11 items-center rounded-full border border-maroon-800/30 px-6 text-sm font-semibold text-maroon-800 hover:bg-maroon-800/5"
              >
                My account
              </Link>
            )}
          </div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <div className="mx-auto max-w-lg py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-maroon-800">
            <ShoppingBag size={30} />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-maroon-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-ink-600">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex h-11 items-center rounded-full bg-maroon-800 px-6 text-sm font-semibold text-cream-50 hover:bg-maroon-700"
          >
            Browse products
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="py-10">
      <Container>
        <h1 className="font-serif text-3xl font-bold text-maroon-900">
          Your Cart
        </h1>
        <Link
          href="/shop"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-maroon-700 hover:text-saffron-600"
        >
          <ArrowLeft size={15} /> Continue shopping
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Line items */}
          <ul className="divide-y divide-cream-200 rounded-2xl border border-cream-200 bg-white">
            {items.map((it) => (
              <li key={it.variantId} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/product/${it.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-cream-200 bg-cream-100"
                >
                  {it.image && (
                    <Image
                      src={it.image}
                      alt={it.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${it.slug}`}
                        className="font-medium text-maroon-900 hover:text-saffron-600"
                      >
                        {it.name}
                      </Link>
                      <p className="text-sm text-ink-400">{it.variantLabel}</p>
                      <p className="mt-0.5 text-sm text-ink-500">
                        {formatINR(it.price)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(it.variantId)}
                      aria-label="Remove item"
                      className="h-fit text-ink-400 hover:text-maroon-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() => setQty(it.variantId, it.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-maroon-800 hover:bg-maroon-800/5"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase"
                        onClick={() => setQty(it.variantId, it.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-maroon-800 hover:bg-maroon-800/5"
                      >
                        <Plus size={15} />
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

          {/* Summary + checkout */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-cream-200 bg-white p-5">
              <h2 className="font-serif text-lg font-bold text-maroon-900">
                Order Summary
              </h2>

              {/* Offer code */}
              <div className="mt-4">
                {offer ? (
                  <div className="flex items-center justify-between rounded-xl bg-leaf-600/10 px-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-leaf-600">
                      <Tag size={14} /> {offer.code} applied
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOffer(null);
                        setCode("");
                      }}
                      className="text-ink-500 hover:text-maroon-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Promo code (try BAS10)"
                      className="h-10 flex-1 rounded-full border border-cream-300 bg-white px-4 text-sm focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
                    />
                    <button
                      type="button"
                      onClick={applyCode}
                      className="h-10 rounded-full bg-maroon-800 px-4 text-sm font-semibold text-cream-50 hover:bg-maroon-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {codeError && (
                  <p className="mt-1.5 text-xs text-maroon-700">{codeError}</p>
                )}
              </div>

              <dl className="mt-4 space-y-2 border-t border-cream-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-600">Subtotal</dt>
                  <dd className="font-medium text-maroon-900">
                    {formatINR(subtotal)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-leaf-600">
                    <dt>Discount</dt>
                    <dd className="font-medium">-{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-600">Shipping</dt>
                  <dd className="font-medium text-maroon-900">
                    {freeShipping ? "Free" : "Calculated at checkout"}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-cream-200 pt-2 text-base">
                  <dt className="font-semibold text-maroon-900">Total</dt>
                  <dd className="font-bold text-maroon-900">
                    {formatINR(total)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Customer details */}
            <div className="rounded-2xl border border-cream-200 bg-white p-5">
              <h2 className="font-serif text-lg font-bold text-maroon-900">
                Your details
              </h2>
              <div className="mt-3 space-y-3">
                <input
                  value={name || customer?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border border-cream-300 bg-white px-4 text-sm focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
                />
                <input
                  value={phone || customer?.phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="Phone number"
                  className="h-11 w-full rounded-xl border border-cream-300 bg-white px-4 text-sm focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40"
                />
              </div>
              {formError && (
                <p className="mt-2 text-xs text-maroon-700">{formError}</p>
              )}

              <button
                type="button"
                onClick={placeWhatsAppOrder}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white hover:bg-[#1fb457]"
              >
                <MessageCircle size={18} /> Place order on WhatsApp
              </button>

              <button
                type="button"
                onClick={payOnline}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-maroon-800/30 text-sm font-semibold text-maroon-800 hover:bg-maroon-800/5"
              >
                <CreditCard size={18} /> Pay online
                <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-500">
                  Soon
                </span>
              </button>
              {payNote && (
                <p className="mt-2 text-center text-xs text-ink-500">{payNote}</p>
              )}

              <p className="mt-3 text-center text-xs text-ink-400">
                Your number is saved so we can confirm and update your order.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
