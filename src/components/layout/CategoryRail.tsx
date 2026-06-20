"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCategoryImage } from "@/lib/images";
import type { Category } from "@/lib/types";

export function CategoryRail({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 360), behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Left edge: fade + arrow, shown only when more items exist to the left */}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-cream-50 to-transparent" />
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Scroll categories left"
            className="absolute left-0 top-[42px] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-maroon-800 shadow-sm transition hover:bg-maroon-800/5 sm:top-[50px]"
          >
            <ChevronLeft size={20} />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        className="flex snap-x scroll-px-1 items-start gap-x-5 overflow-x-auto px-1 pb-2 sm:gap-x-8 md:justify-center md:gap-x-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          <span className="mt-2.5 line-clamp-2 h-[2.2rem] text-center text-[11px] font-semibold leading-snug tracking-tight text-maroon-900 sm:text-xs">
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
            <span className="mt-2.5 line-clamp-2 h-[2.2rem] text-center text-[11px] font-medium leading-snug tracking-tight text-maroon-900/90 sm:text-xs">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Right edge: fade + arrow, shown only when more items exist to the right */}
      {canRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-cream-50 to-transparent" />
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Scroll categories right"
            className="absolute right-0 top-[42px] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-maroon-800 shadow-sm transition hover:bg-maroon-800/5 sm:top-[50px]"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
