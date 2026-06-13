# TODO - Find My Order: phone search + data privacy

- [x] Add public API endpoint for phone lookup: `src/app/api/orders/lookup/phone/[phone]/route.ts`
  - [x] Validate phone format
  - [x] Query `orders` by `customer_phone` and return only public/safe fields
  - [x] Do NOT return customer_phone/name/email/address/notes/razorpay ids

- [x] Update frontend `src/app/find-my-order/page.tsx`
  - [x] Accept either order id or phone number
  - [x] Call `/api/orders/lookup/{orderId}` for order id search
  - [x] Call `/api/orders/lookup/phone/{phone}` for phone search (show most recent order)
  - [x] Mask sensitive-ish fields in UI (e.g., delivery tracking id last 4)
- [x] Ensure error/help text is correct and doesn’t leak details
- [x] Update/verify types and imports compile
- [x] Run `npm test`/`npm run lint`/`npm run build` (as available) to confirm everything compiles

