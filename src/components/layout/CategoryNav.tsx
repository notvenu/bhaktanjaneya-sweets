import Link from "next/link";
import Image from "next/image";
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
        <div className="-mx-4 flex snap-x items-start gap-x-8 overflow-x-auto px-4 pb-2 sm:gap-x-12 md:justify-center md:gap-x-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group flex w-[88px] shrink-0 snap-start flex-col items-center sm:w-[104px]"
            >
              <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full border border-maroon-800/15 bg-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03] sm:h-[104px] sm:w-[104px]">
                <Image
                  src={getCategoryImage(category)}
                  alt={category.name}
                  fill
                  sizes="104px"
                  className="object-cover"
                />
              </div>
              <span className="mt-3 text-center font-serif text-sm font-medium leading-tight text-maroon-900 sm:text-base">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
