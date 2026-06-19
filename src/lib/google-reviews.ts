// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE REVIEWS  —  EDIT THIS FILE TO SHOW REAL REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
//  These power the "Loved on Google" section on the homepage. They are CURRENTLY
//  PLACEHOLDERS. To go live with real reviews:
//
//   1. Open your Google Business Profile / Google Maps listing.
//   2. Copy 3–5 genuine reviews (reviewer name, star rating, the text, and when
//      it was posted) into the `googleReviews` array below.
//   3. Set the "Read all reviews on Google" link by either:
//        • setting NEXT_PUBLIC_GOOGLE_REVIEWS_URL in your environment, or
//        • editing `googleReviewsUrl` in src/lib/config.ts.
//   4. (Optional) Update `googleRatingSummary` with your real average + count.
//
//  Nothing here is fetched from Google automatically — it is hand-curated so the
//  homepage is always fast and you control exactly which reviews appear.
// ─────────────────────────────────────────────────────────────────────────────

export interface GoogleReview {
  /** Reviewer's display name as shown on Google. */
  author: string;
  /** Star rating they gave, 1–5. */
  rating: number;
  /** The review text. Keep it as written by the customer. */
  text: string;
  /** Human-readable "when", e.g. "2 weeks ago" or "March 2026". */
  relativeTime: string;
  /** Optional reviewer photo URL. Falls back to an initial avatar. */
  avatar?: string;
}

/** TODO: Replace every entry below with a real Google review. */
export const googleReviews: GoogleReview[] = [
  {
    author: "Lakshmi Prasad",
    rating: 5,
    text: "The Kaju Patisa tastes exactly like my grandmother used to make. Fresh, pure ghee, and beautifully packed. Will order again for every festival.",
    relativeTime: "2 weeks ago",
  },
  {
    author: "Ravi Teja",
    rating: 5,
    text: "Ordered the Agra Mixture for Diwali — crunchy, perfectly spiced, and delivered on time. Highly recommend to anyone in Hyderabad.",
    relativeTime: "a month ago",
  },
  {
    author: "Sneha Reddy",
    rating: 5,
    text: "Finally a sweets brand that doesn't use artificial flavours. The Junnu was a delightful surprise and the quality is consistent.",
    relativeTime: "a month ago",
  },
  {
    author: "Anil Kumar",
    rating: 5,
    text: "We ordered bulk gift boxes for our office. Professional service, neat packing, and everyone loved the quality. Great for corporate gifting.",
    relativeTime: "2 months ago",
  },
];

/** Aggregate rating shown next to the section heading. Update to match Google. */
export const googleRatingSummary = {
  average: 4.9,
  count: googleReviews.length,
};
