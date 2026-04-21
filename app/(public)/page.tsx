 "use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listFeaturedProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { Loader } from "@/components/ui/Loader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useAuthStore } from "@/stores/useAuthStore";
import { Category } from "@/types/product";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const categoryImages: Record<string, string> = {
    "cat-men": "/assets/categories/fashion.jpg",
    "cat-shoes": "/assets/categories/shoes.jpg",
    "cat-tech": "/assets/categories/tech.jpg",
  };
  const defaultCategoryImage = "/assets/categories/fashion.jpg";
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => listFeaturedProducts(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => listCategories(),
  });
  const prioritizedCategoryId = categories[0]?.id;

  const getCategoryImage = (category: Category) => {
    const customImage = category.image?.trim();
    return customImage || categoryImages[category.id] || defaultCategoryImage;
  };

  return (
    <div className="container-safe space-y-12 py-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-white/10 px-5 py-10 text-white shadow-[0_24px_80px_rgba(15,15,20,0.2)] sm:px-8 sm:py-14"
      >
        <div className="absolute inset-0">
          <Image
            src="/assets/home/acceuilBanner.jpg"
            alt="Bannière d'accueil KHIDMA SHOP"
            fill
            sizes="(min-width: 1280px) 1080px, (min-width: 768px) 720px, 100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,10,16,0.62),rgba(17,19,28,0.32)),radial-gradient(circle_at_top_right,rgba(255,216,133,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
        </div>
        <div className="relative flex w-full max-w-3xl flex-col items-start gap-5 text-left">
          <p className="text-xs uppercase tracking-[0.45em] text-white/55">KHIDMA SHOP</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Des vêtements, des chaussures et de l’électronique pour tous les jours.
          </h1>
          <p className="max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            Choisissez facilement vos articles préférés et commandez en quelques clics.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/products" className="btn-base w-full bg-white px-5 py-3 text-black sm:w-auto">
              Voir les produits <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">Catégories</p>
            <h2 className="section-title">Nos catégories</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-black/70">
            Tout voir
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="flex w-[240px] shrink-0 items-center gap-4 rounded-[1.6rem] border border-black/10 bg-white p-3 transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md sm:w-[280px]"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.2rem] border border-black/10 bg-black/5">
              <Image
                src={getCategoryImage(category)}
                alt={category.name}
                fill
                sizes="(min-width: 1280px) 200px, (min-width: 768px) 180px, 120px"
                priority={category.id === prioritizedCategoryId}
                loading={category.id === prioritizedCategoryId ? undefined : "lazy"}
                className="object-cover"
              />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-tight">{category.name}</p>
                <p className="mt-1 text-xs text-black/45">Ouvrir la catégorie</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">Vedettes</p>
            <h2 className="section-title">Produits populaires</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-black/70">
            Tout voir
          </Link>
        </div>
        {isLoading ? <Loader className="py-10" /> : <ProductGrid products={data ?? []} />}
      </section>
    </div>
  );
}
