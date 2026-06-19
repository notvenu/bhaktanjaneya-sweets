# API Contract — Bhaktanjaneya Sweets

This is the handoff spec between the **frontend** (this repo) and the **backend**.
The frontend already has every call wired behind a single switch:

```
NEXT_PUBLIC_USE_MOCK=true    # bundled mock JSON / localStorage (default)
NEXT_PUBLIC_USE_MOCK=false   # call the real API at NEXT_PUBLIC_API_BASE_URL
```

When mock mode is off, all requests go through `src/lib/api/client.ts`
(`apiGet/apiPost/apiPut/apiDelete`) to `${NEXT_PUBLIC_API_BASE_URL}${path}`.
Implement the endpoints below to match, and the UI works unchanged.

- **Money**: all prices are **INR rupees as integers** (e.g. `250` = ₹250). The
  only exception is Razorpay `amount`, which is in **paise** (rupees × 100).
- **Content-Type**: `application/json` for all requests and responses.
- **Source of truth for shapes**: `src/lib/types.ts`. The interfaces are repeated
  here for convenience — keep them in sync.
- **Auth**: protected endpoints expect `Authorization: Bearer <token>` where the
  token is the one returned by the login endpoints. Attach it in
  `src/lib/api/client.ts` (one place) once the backend issues real tokens.

---

## 1. Data types

```ts
interface Variant {
  id: string;        // unique within a product; the cart/order line key
  label: string;     // "250 g", "1 kg", "12 pieces"
  price: number;     // selling price, INR rupees
  mrp?: number;      // optional original price for strike-through
  stock: number;     // units in stock
  pieces?: number;   // optional piece count for weight packs (e.g. 250 g = 5 pcs)
}

interface Product {
  id: string;
  slug: string;            // URL key, unique
  name: string;
  description: string;
  category: string;        // category slug
  categoryLabel?: string;  // display name (denormalized)
  images: string[];        // URLs
  variants: Variant[];
  tags: string[];          // "best-seller" | "top-pick" | "combo" | "new"
  rating: number;          // 0–5
  reviewCount: number;
  active: boolean;         // hidden from storefront when false
  taxRate?: number;        // GST percentage (e.g. 5 for 5%)
  extraCharges?: number;   // Flat INR charges
  badges?: string[];       // "Pure Ghee", "100% Veg", …
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;          // sort order, ascending
}

type OfferType = "percent" | "flat" | "free_shipping";

interface Offer {
  id: string;
  code: string;            // coupon code, e.g. "BAS10"
  title: string;
  description?: string;
  type: OfferType;
  value: number;           // percent (0–100) or flat INR; 0 for free_shipping
  minSubtotal?: number;    // min cart subtotal to qualify
  active: boolean;
  startsAt?: string;       // ISO date
  endsAt?: string;         // ISO date
}

interface Customer {
  id: string;
  phone: string;           // 10-digit, no country code
  name?: string;
  email?: string;
  createdAt: string;       // ISO
  ordersCount?: number;
}

interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  productId: string;
  name: string;
  variantLabel: string;
  price: number;           // unit price, INR
  quantity: number;
}

type OrderChannel = "whatsapp" | "online";
type PaymentStatus = "pending" | "paid" | "failed" | "cod";
type OrderStatus =
  | "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  customerPhone: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  shippingAddress?: Address;
  total: number;
  taxAmount?: number;
  extraChargesAmount?: number;
  channel: OrderChannel;
  paymentStatus: PaymentStatus;
  deliveryCompany?: string;
  deliveryTrackingId?: string;
  status: OrderStatus;
  createdAt: string;       // ISO
}

interface Session  { token: string; customer?: Customer; }   // customer login
interface AdminUser { id: string; email: string; name?: string; role: "admin"; }
interface AdminSession { token: string; user: AdminUser; }   // admin login
```

---

## 2. Storefront (public, read-only) — already wired

These power the server-rendered storefront. Return only `active` products/offers.

| Method & path                       | Frontend fn (`src/lib/api/…`)        | Response          |
| ----------------------------------- | ------------------------------------ | ----------------- |
| `GET /products`                     | `products.getProducts()`             | `Product[]`       |
| `GET /products/:slug`               | `products.getProductBySlug(slug)`    | `Product \| null` |
| `GET /products?category=:slug`      | `products.getProductsByCategory()`   | `Product[]`       |
| `GET /products?tag=:tag`            | `products.getProductsByTag(tag)`     | `Product[]`       |
| `GET /categories`                   | `categories.getCategories()`         | `Category[]`      |
| `GET /categories/:slug`             | `categories.getCategory(slug)`       | `Category \| null`|
| `GET /offers?active=true`           | `offers.getActiveOffers()`           | `Offer[]`         |
| `GET /api/pincode/:code`            | `pincode.lookupPincode(code)`        | `{ city, state, pincode }` |

`404` may be returned for the `:slug` lookups instead of `null`; the frontend
treats a non-OK response as "not found".

---

## 3. Customer auth (phone + OTP) — already wired

`src/lib/api/auth.ts`. In mock mode the accepted code is `123456`.

**`POST /auth/request-otp`**
```jsonc
// request
{ "phone": "9876543210" }
// response
{ "ok": true }            // send the SMS server-side; never return the code in prod
```

**`POST /auth/verify-otp`**
```jsonc
// request
{ "phone": "9876543210", "code": "123456" }
// response 200 → Session
{ "token": "jwt…", "customer": { "id": "cus_…", "phone": "9876543210",
  "createdAt": "2026-06-07T…", "name": "Asha" } }
// response 4xx on wrong/expired code → frontend shows the error message
```

---

## 4. Orders

The cart builds an `Order` client-side. Today WhatsApp orders are recorded
locally; when the backend exists, **POST the order** so it appears in admin and
(for online payments) can be tied to a Razorpay payment.

**`POST /orders`** — create an order
```jsonc
// request: Order without server-assigned fields
{ "customerPhone": "9876543210", "customerName": "Asha",
  "items": [ { "productId": "prod_1", "name": "Kaju Patisa",
    "variantLabel": "250 g", "price": 250, "quantity": 2 } ],
  "subtotal": 500, "discount": 50, "shipping": 0, "total": 450,
  "channel": "whatsapp", "paymentStatus": "pending", "status": "new" }
// response 201 → the persisted Order (with id + createdAt)
```

> Wire-up note: the cart currently calls `recordOrder()` in
> `src/lib/admin/store.ts`. Replace that with a `POST /orders` call (add an
> `orders.createOrder()` function in `src/lib/api/`) when the backend is ready.

---

## 5. Payments — Razorpay (phase 2) — seam ready, throws in mock

`src/lib/api/payments.ts`. The frontend **never** sees `key_secret`.

Flow: `createRazorpayOrder` → open Razorpay Checkout with `{ id, keyId }` →
on success send the signature to `verifyRazorpayPayment` → backend verifies
(HMAC-SHA256 with `key_secret`) and marks the order paid.

**`POST /payments/razorpay/order`**
```jsonc
// request  (amount is in PAISE = rupees × 100)
{ "amount": 45000 }
// response → RazorpayOrder
{ "id": "order_Xyz", "amount": 45000, "currency": "INR", "keyId": "rzp_live_…" }
```

**`POST /payments/razorpay/verify`**
```jsonc
// request
{ "razorpay_order_id": "order_Xyz", "razorpay_payment_id": "pay_Abc",
  "razorpay_signature": "…" }
// response
{ "verified": true }
```

---

## 6. Admin — to implement (currently localStorage)

The admin panel (`/admin`) currently reads/writes the browser via
`src/lib/admin/store.ts`, surfaced through `src/context/AdminContext.tsx`.
To make it real, implement the endpoints below and swap the bodies of the
`AdminContext` CRUD methods to call them. All require admin bearer auth.

**`POST /admin/login`** — already wired in `src/lib/api/adminAuth.ts`
```jsonc
// request
{ "email": "admin@bhaktanjaneyasweets.com", "password": "••••" }
// response → AdminSession
{ "token": "jwt…", "user": { "id": "adm_1",
  "email": "admin@bhaktanjaneyasweets.com", "name": "Store Admin",
  "role": "admin" } }
```

| Resource   | Endpoints                                                              |
| ---------- | --------------------------------------------------------------------- |
| Products   | `GET /admin/products` · `POST /admin/products` · `PUT /admin/products/:id` · `DELETE /admin/products/:id` |
| Categories | `GET /admin/categories` · `POST /admin/categories` · `PUT /admin/categories/:id` · `DELETE /admin/categories/:id` |
| Offers     | `GET /admin/offers` · `POST /admin/offers` · `PUT /admin/offers/:id` · `DELETE /admin/offers/:id` |
| Orders     | `GET /admin/orders` · `PATCH /admin/orders/:id` `{ status, deliveryCompany?, deliveryTrackingId? }`. *Note: When status is set to "shipped", the Admin UI must prompt for and require tracking details before submitting.* |
| Customers  | `GET /admin/customers` |

Request/response bodies use the same `Product` / `Category` / `Offer` / `Order` /
`Customer` shapes from §1. `POST` accepts the object without server fields and
returns the persisted record; `PUT`/`PATCH` return the updated record; `DELETE`
returns `204`.

---

## 7. WhatsApp (no backend needed)

WhatsApp ordering is a client-side `https://wa.me/<number>?text=<message>` deep
link built in `src/lib/whatsapp.ts` from `NEXT_PUBLIC_WHATSAPP_NUMBER`. Nothing
to implement server-side; it works in every mode.

---

## 8. Wire-up checklist

1. Deploy the backend; set `NEXT_PUBLIC_API_BASE_URL` to its URL.
2. Set `NEXT_PUBLIC_USE_MOCK=false`.
3. Add `Authorization: Bearer` injection in `src/lib/api/client.ts`.
4. Add `orders.createOrder()` and point the cart at it (replaces `recordOrder`).
5. Swap `AdminContext` CRUD method bodies to call the `/admin/*` endpoints.
6. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and ship the payment endpoints for phase 2.
```
