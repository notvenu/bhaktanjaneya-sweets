export interface InstagramReel {
  id: string;
  /** Instagram Reel shortcode (found in the Reel URL, e.g. https://www.instagram.com/reel/SHORTCODE/) */
  shortcode: string;
  /** Link to watch the Reel directly on Instagram */
  link: string;
}

/**
 * Configure the Reels to embed on the home page.
 * Replace the shortcodes below with the actual shortcodes from the @bhaktanjaneyasweets.in profile.
 */
export const instagramReels: InstagramReel[] = [
  {
    id: "reel-1",
    shortcode: "C39x_LpM9y0", // Replace with your real sweet-making/cooking Reel shortcode
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-2",
    shortcode: "C58o_kNSd8x", // Replace with your real sweet-making/cooking Reel shortcode
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-3",
    shortcode: "C0600Hivd_K", // Replace with your real sweet-making/cooking Reel shortcode
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-4",
    shortcode: "C8f4WlOP2b-", // Replace with your real sweet-making/cooking Reel shortcode
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
];

