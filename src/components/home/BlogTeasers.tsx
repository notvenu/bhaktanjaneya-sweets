import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts } from "@/lib/api/posts";
import { formatDate } from "@/lib/utils";

export async function BlogTeasers() {
  const posts = (await getPosts()).slice(0, 3);
  if (!posts.length) return null;

  return (
    <section className="py-12">
      <Container>
        <SectionHeading
          eyebrow="From our kitchen"
          title="Stories & guides"
          action={
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-maroon-800 transition-colors hover:text-saffron-600"
            >
              All articles <ArrowRight size={15} />
            </Link>
          }
        />

        {/* Compact, scannable list — small thumbnail + title + meta */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-cream-200 bg-white p-3 transition-colors hover:border-saffron-400/50 hover:bg-cream-50"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                <Image
                  src={p.cover}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                  {formatDate(p.date)} · {p.readMinutes} min read
                </p>
                <h3 className="mt-1 line-clamp-2 font-serif text-sm font-semibold leading-snug text-maroon-900 transition-colors group-hover:text-saffron-600">
                  {p.title}
                </h3>
              </div>
              <ArrowRight
                size={18}
                className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-saffron-600"
              />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
