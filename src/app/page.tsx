import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramReels } from "@/components/home/InstagramReels";
import { BlogTeasers } from "@/components/home/BlogTeasers";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { getProducts } from "@/lib/api/products";
import { getLiveGoogleReviews } from "@/lib/google-reviews";
import { getLiveInstagramReels } from "@/lib/instagram-reels";

// Statically rendered and revalidated every 2 minutes (ISR). All data sources
// below are individually cached, so the page no longer hits the DB or external
// APIs on every visit.
export const revalidate = 120;

export default async function HomePage() {
  const [products, liveReviewsData, liveReels] = await Promise.all([
    getProducts(),
    getLiveGoogleReviews(),
    getLiveInstagramReels(),
  ]);

  const topPicks = products.filter((p) => p.tags.includes("top-pick"));
  const bestSellers = products.filter((p) => p.tags.includes("best-seller"));

  return (
    <>
      <Hero />
      <TrustStrip />
      <ProductCarousel
        eyebrow="Handpicked for you"
        title="Top Picks"
        viewAllHref="/shop?tag=top-pick"
        products={topPicks.length ? topPicks : products.slice(0, 6)}
      />
      <OfferBanner />
      <ProductCarousel
        eyebrow="Customer favourites"
        title="Best Sellers"
        viewAllHref="/shop?tag=best-seller"
        products={bestSellers.length ? bestSellers : products.slice(0, 6)}
      />
      <Testimonials
        reviews={liveReviewsData.reviews}
        ratingSummary={liveReviewsData.ratingSummary}
      />
      <InstagramReels reels={liveReels} />
      <BlogTeasers />
      <NewsletterCTA />
    </>
  );
}


