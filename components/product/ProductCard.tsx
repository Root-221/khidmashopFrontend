"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { useCartStore } from "@/stores/useCartStore";
import { useToast } from "@/hooks/useToast";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toast = useToast();

  return (
    <motion.article whileTap={{ scale: 0.99 }} className="card-base overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-black/5 sm:aspect-[4/5]">
          <Image
            src={product.images[0] ?? "/assets/products/chemise-1.jpg"}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 280px, 200px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">{product.brand}</p>
          <Link href={`/products/${product.id}`} className="block truncate text-sm font-medium leading-5 sm:text-[15px]">
            {product.name}
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-black/55 sm:text-xs">
            <Star className="h-3.5 w-3.5 fill-black" />
            <span className="shrink-0">{product.rating.toFixed(1)}</span>
            <span className="shrink-0">•</span>
            <span className="min-w-0 truncate">{product.categoryName}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold leading-none sm:text-base">{formatCurrency(product.price)}</p>
          <button
            type="button"
            onClick={() => {
              addItem(product, { quantity: 1, size: product.sizes[0], color: product.colors[0] });
              toast.success("Produit ajouté au panier", product.name);
            }}
            className="btn-base w-full bg-black px-3 py-3 text-xs text-white sm:w-auto sm:self-start sm:px-4 sm:py-2"
          >
            <ShoppingCart className="mr-2 h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  );
}
