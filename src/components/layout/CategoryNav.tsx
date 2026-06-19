import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getCategoryImage } from "@/lib/images";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export async function CategoryNav() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <section className="border-b border-cream-300/60 bg-cream-50 py-6 sm:py-8">
      <Container>
        {/* Horizontally scrollable on every screen — never wraps to a new row. */}
        <div
          className="-mx-4 flex snap-x items-start gap-x-5 overflow-x-auto px-4 pb-2 sm:gap-x-8 md:justify-center md:gap-x-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          data-cat-scroll
        >
          {/* Shop All — always first */}
          <Link
            href="/shop"
            aria-label="Shop All"
            className="group flex w-[76px] shrink-0 snap-start flex-col items-center sm:w-[92px]"
          >
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-maroon-800/15 bg-gradient-to-br from-maroon-800 to-maroon-900 text-saffron-300 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] sm:h-[92px] sm:w-[92px]">
              <LayoutGrid size={30} strokeWidth={1.75} />
            </div>
            <span className="mt-2.5 flex min-h-[2.4rem] items-start justify-center text-center font-serif text-xs font-semibold leading-tight text-maroon-900 sm:text-sm">
              Shop All
            </span>
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group flex w-[76px] shrink-0 snap-start flex-col items-center sm:w-[92px]"
            >
              <div className="relative h-[76px] w-[76px] overflow-hidden rounded-full border border-maroon-800/15 bg-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03] sm:h-[92px] sm:w-[92px]">
                <Image
                  src={getCategoryImage(category)}
                  alt={category.name}
                  fill
                  sizes="92px"
                  className="object-cover"
                />
              </div>
              <span className="mt-2.5 flex min-h-[2.4rem] items-start justify-center text-center font-serif text-xs font-medium leading-tight text-maroon-900 sm:text-sm">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
