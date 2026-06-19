import { Star, ExternalLink, PenSquare } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { config } from "@/lib/config";
import { googleRatingSummary } from "@/lib/google-reviews";

/** Google "G" logo — official four-colour mark, inline so it needs no asset. */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export function Testimonials() {
  const writeReviewUrl = `${config.googleReviewsUrl}?action=write-review`;

  return (
    <section className="py-14 bg-white border-t border-cream-200">
      <Container>
        <SectionHeading
          eyebrow="Loved on Google"
          title="What our customers say"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch mt-8">
          {/* Rating summary & CTAs Column */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-cream-200 bg-cream-50/30 p-6 sm:p-8 shadow-soft">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <GoogleG className="h-12 w-12 shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-maroon-900">Google Business Profile</h4>
                  <p className="text-xs text-ink-500">Sri Sai Bhaktanjaneya Sweets</p>
                </div>
              </div>

              {/* Large Star/Score Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-maroon-900 tracking-tight">
                    {googleRatingSummary.average.toFixed(1)}
                  </span>
                  <span className="text-lg font-semibold text-ink-400">/ 5.0</span>
                </div>
                <div className="flex gap-1 text-saffron-500 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(googleRatingSummary.average)
                          ? "fill-saffron-500 text-saffron-500"
                          : "text-cream-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-ink-600 mt-2">
                  Based on {googleRatingSummary.count}+ verified customer reviews
                </p>
              </div>

              <p className="text-sm leading-relaxed text-ink-600 mb-6">
                We are proud to serve our signature Tapeswaram Kaja and other pure ghee traditional sweets to families across the region. View our live listing and reviews on Google Maps.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={config.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-maroon-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-maroon-800 shadow-sm"
              >
                Read all reviews
                <ExternalLink size={15} />
              </a>
              <a
                href={writeReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-maroon-800/30 bg-white px-5 text-sm font-semibold text-maroon-800 transition-colors hover:bg-maroon-800/5 shadow-sm"
              >
                Write a review
                <PenSquare size={15} />
              </a>
            </div>
          </div>

          {/* Embedded Google Maps Place Column */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-cream-200 bg-cream-100 shadow-soft h-[350px] sm:h-[400px] lg:h-auto min-h-[350px]">
            <iframe
              src="https://maps.google.com/maps?q=Sri%20Sai%20Bhaktanjaneya%20Sweets%20Morampudi%20Junction%20Rajahmundry&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

