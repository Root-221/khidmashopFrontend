"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { listCategories } from "@/services/category.service";
import { listProductBrands, listProducts } from "@/services/product.service";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/admin/Pagination";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/utils/cn";

export function ProductsPageClient() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    search: "",
    categoryId: "",
    brand: "",
    maxPrice: 100000,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const categoryId = searchParams.get("categoryId") ?? "";
    const search = searchParams.get("search") ?? "";

    setFilters((current) => ({
      ...current,
      search,
      categoryId,
    }));
    setCurrentPage(1);
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: () => listProductBrands(),
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts(filters),
  });

  const heading = useMemo(() => {
    const total = products.length;
    return `${total} produit${total > 1 ? "s" : ""}`;
  }, [products.length]);

  const totalPages = useMemo(() => Math.ceil(products.length / itemsPerPage), [products.length, itemsPerPage]);
  
  const paginatedProducts = useMemo(() => {
    return products.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [products, currentPage, itemsPerPage]);

  const categoryImages: Record<string, string> = {
    "cat-men": "/assets/categories/fashion.jpg",
    "cat-shoes": "/assets/categories/shoes.jpg",
    "cat-tech": "/assets/categories/tech.jpg",
  };

  return (
    <div className="container-safe space-y-6 py-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-white/10 px-5 py-10 text-white shadow-[0_24px_80px_rgba(15,15,20,0.18)] sm:px-8 sm:py-12"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(11, 12, 18, 0.62), rgba(20, 24, 35, 0.34)), url('/assets/products/headphone-1.jpg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,137,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative flex w-full max-w-3xl flex-col items-start gap-4 text-left">
          <p className="text-xs uppercase tracking-[0.45em] text-white/55">Catalogue</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Explorez les collections</h1>
          <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Des pièces sélectionnées pour l’habillement homme et l’électronique, avec de vraies photos produits pour mieux
            apprécier chaque article.
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-white/60">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 backdrop-blur-sm">
              {heading}
            </span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 backdrop-blur-sm">
              Habillement homme
            </span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 backdrop-blur-sm">
              Électronique
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cart" className="btn-base bg-white px-5 py-3 text-black">
              Voir le panier
            </Link>
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Catalogue</p>
        <h2 className="section-title">Affinez votre recherche</h2>
        <p className="text-sm text-black/60">{heading}</p>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Rechercher une chemise, une sneaker ou un accessoire..."
              className="input-base py-4 pl-11 text-base"
            />
          </label>
          <button
            type="button"
            onClick={() => setFilters({ search: "", categoryId: "", brand: "", maxPrice: 100000 })}
            className="btn-base border border-black/10 bg-black px-4 py-4 text-white"
          >
            Réinitialiser
          </button>
        </div>

      </div>

      <ProductFilters categories={categories} brands={brands} value={filters} onChange={setFilters} showSearch={false} />

      {isLoading ? (
        <Loader className="py-10" />
      ) : (
        <div className="space-y-6">
          <ProductGrid products={paginatedProducts} />
          <div className="hidden sm:block">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
