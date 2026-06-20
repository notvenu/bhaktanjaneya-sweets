export interface InstagramReel {
  id: string;
  thumbnail: string;
  caption: string;
  likes: string;
  views: string;
  link: string;
}

export const instagramReels: InstagramReel[] = [
  {
    id: "reel-1",
    thumbnail: "/images/tapeswaram_kaja_reel.png",
    caption: "Preparing the iconic Tapeswaram Kaja in pure ghee. The secret is in our traditional layers! ✨ #TapeswaramKaja #PureGheeSweets #AndhraSweets",
    likes: "2.4k",
    views: "28.5k",
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-2",
    thumbnail: "/images/madatha_kaja_reel.png",
    caption: "Behind the scenes: Crafting our famous syrupy Madatha Kaja. Every bite is pure bliss! 🍯💫 #MadathaKaja #SweetMakers #AndhraFoodie",
    likes: "4.1k",
    views: "42.9k",
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-3",
    thumbnail: "/images/special_mixture_reel.png",
    caption: "Our crunchy, spicy Special Mixture being made fresh today! Perfect snack for your evening chai ☕️ #IndianSnacks #TeaTime #RajahmundryFood",
    likes: "1.8k",
    views: "18.2k",
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
  {
    id: "reel-4",
    thumbnail: "/images/ghee_ladoo_reel.png",
    caption: "Mouth-watering Ladoos made with premium nuts and pure buffalo ghee. Taste the tradition! 🥥🍯 #GheeSweets #TraditionOfTaste #FestivalSweets",
    likes: "3.2k",
    views: "35.1k",
    link: "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
  },
];

/**
 * Fetches reels from a public RSS/JSON feed (e.g. an RSS.app feed generated from
 * the public Instagram profile URL — no Instagram account/login required).
 * Returns null if not configured or the request fails, so the caller can fall back.
 */
export async function getRssReels(): Promise<InstagramReel[] | null> {
  const feedUrl = process.env.INSTAGRAM_RSS_URL;
  if (!feedUrl) return null;

  try {
    const res = await fetch(feedUrl, { cache: "no-store" });
    const data = await res.json();
    const items: any[] = data?.items ?? [];

    const reels: InstagramReel[] = items
      .map((item) => {
        const caption = (item.title || item.content_text || item.content_html || "")
          .replace(/<[^>]*>/g, "") // strip any HTML tags
          .trim();
        const thumbnail =
          item.image ||
          item.banner_image ||
          item.attachments?.[0]?.url ||
          "";
        return {
          id: String(item.id || item.url || caption),
          thumbnail,
          caption,
          likes: "View",
          views: "Reel",
          link: item.url || "https://www.instagram.com/bhaktanjaneyasweets.in/reels/",
        };
      })
      .filter((r) => r.thumbnail); // need a cover image to show a card

    return reels.length ? reels : null;
  } catch (error) {
    console.error("Error fetching Instagram RSS feed:", error);
    return null;
  }
}

/**
 * Live reels for the homepage. Prefers the public RSS feed (no account needed),
 * then the official Instagram Graph API, then local hand-curated covers.
 */
export async function getLiveInstagramReels() {
  const rss = await getRssReels();
  if (rss) return rss;

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return instagramReels;
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=12&access_token=${token}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache Instagram reels server-side for 1 hour
    });
    
    const data = await res.json();
    if (!data.data) {
      console.warn("Instagram API returned no media data:", data);
      return instagramReels;
    }

    // Filter to only show video/reel posts and map them
    const mappedReels = data.data
      .filter((item: any) => item.media_type === "VIDEO" || item.media_type === "CAROUSEL_ALBUM")
      .map((item: any) => ({
        id: item.id,
        thumbnail: item.thumbnail_url || item.media_url,
        caption: item.caption || "",
        likes: "View", // Basic Display API has restricted permissions and doesn't return count directly
        views: "Reel",
        link: item.permalink,
      }));

    return mappedReels.length ? mappedReels : instagramReels;
  } catch (error) {
    console.error("Error fetching Instagram reels:", error);
    return instagramReels;
  }
}



