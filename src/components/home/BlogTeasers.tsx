import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts } from "@/lib/api/posts";
import { formatDate } from "@/lib/utils";

export async function BlogTeasers() {
  const posts = (await getPosts()).slice(0, 3);
  return (
    <section className="bg-cream-100 py-14">
      <Container>
        <SectionHeading
          eyebrow="From our kitchen"
          title="Stories & guides"
          action={
            <Link
              href="/blog"
              className="hidden text-sm font-semibold text-maroon-800 underline-offset-4 hover:text-saffron-600 hover:underline sm:inline"
            >
              All articles
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-100">
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-ink-400">
                  {formatDate(p.date)} • {p.readMinutes} min read
                </p>
                <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-maroon-900 transition-colors group-hover:text-saffron-600">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-500">
                  {p.excerpt}
                </p>
                <span className="mt-3 text-sm font-semibold text-saffron-600">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
