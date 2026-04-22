"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types/product";
import { cn } from "@/utils/cn";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 overflow-hidden rounded-3xl border border-black/10 bg-black/5">
        <div className="relative w-full min-h-[400px] lg:min-h-[600px]">
          {/* Background blurred layer to fill the div */}
          <Image
            src={product.images[active]}
            alt=""
            fill
            className="object-cover blur-2xl opacity-30"
            aria-hidden="true"
          />
          {/* Main image in contain mode to see it 'as is' */}
          <Image
            src={product.images[active]}
            alt={product.name}
            fill
            className="relative z-10 object-contain p-4 rounded-3xl"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {product.images.map((image, index) => (
          <button
            type="button"
            key={image}
            onClick={() => setActive(index)}
            className={cn(
              "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border",
              active === index ? "border-black" : "border-black/10",
            )}
          >
            <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-contain" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
