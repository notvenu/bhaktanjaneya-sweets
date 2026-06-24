import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramReels } from "@/components/home/InstagramReels";
import { BlogTeasers } from "@/components/home/BlogTeasers";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { getProducts } from "@/lib/api/products";
import { getFeaturedTags } from "@/lib/api/tags";
import { getLiveGoogleReviews } from "@/lib/google-reviews";
import { getLiveInstagramReels } from "@/lib/instagram-reels";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [products, featuredTags, liveReviewsData, liveReels] = await Promise.all([
    getProducts(),
    getFeaturedTags(),
    getLiveGoogleReviews(),
    getLiveInstagramReels(),
  ]);

  // Build a carousel for each admin-featured tag. Falls back to a generic
  // "Top Picks" rail if no tags are featured yet.
  const tagRails = (
    featuredTags.length
      ? featuredTags.map((t) => ({
          slug: t.slug,
          title: t.name,
          products: products.filter((p) => p.tags.includes(t.slug)),
        }))
      : [{ slug: "", title: "Top Picks", products: products.slice(0, 6) }]
  )
    // Drop empty rails, but keep at least one so the page never looks bare.
    .filter((rail, i) => rail.products.length > 0 || i === 0)
    .map((rail) => ({
      ...rail,
      products: rail.products.length ? rail.products : products.slice(0, 6),
    }));

  return (
    <>
      <Hero />
      <TrustStrip />
      {tagRails.map((rail, i) => (
        <div key={rail.slug || i}>
          <ProductCarousel
            eyebrow={i === 0 ? "Handpicked for you" : "More to love"}
            title={rail.title}
            viewAllHref={rail.slug ? `/shop?tag=${rail.slug}` : "/shop"}
            products={rail.products}
          />
          {/* Slot the offer banner in after the first rail. */}
          {i === 0 ? <OfferBanner /> : null}
        </div>
      ))}
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


