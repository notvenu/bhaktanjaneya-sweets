"use client";

import Image from "next/image";
import { useState } from "react";
import { getProductImages } from "@/lib/images";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  category,
}: {
  images: string[];
  name: string;
  category: string;
}) {
  const imgs = getProductImages({ images, category });
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-cream-200 bg-cream-100">
        <Image
          src={imgs[active]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {imgs.length > 1 && (
        <div className="mt-3 flex gap-3">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-20 w-20 overflow-hidden rounded-xl border bg-cream-100 transition-colors",
                i === active ? "border-maroon-800" : "border-cream-200",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
