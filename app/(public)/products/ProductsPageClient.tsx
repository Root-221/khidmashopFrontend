"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { listCategories } from "@/services/category.service";
import { listProductBrands, listProducts } from "@/services/product.service";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Loader } from "@/components/ui/Loader";

type CatalogFilters = {
  search: string;
  categoryId: string;
  brand: string;
  maxPrice: number;
};

type ActiveFilter = {
  key: string;
  label: string;
  clear: () => void;
};

const createDefaultFilters = (): CatalogFilters => ({
  search: "",
  categoryId: "",
  brand: "",
  maxPrice: 100000,
});

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>(createDefaultFilters);

  useEffect(() => {
    const categoryId = searchParams.get("categoryId") ?? "";
    const search = searchParams.get("search") ?? "";

    setFilters((current) => ({
      ...current,
      search,
      categoryId,
    }));
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

  const resultLabel = `${products.length} produit${products.length > 1 ? "s" : ""}`;
  const activeFilterCount =
    Number(Boolean(filters.search.trim())) +
    Number(Boolean(filters.categoryId)) +
    Number(Boolean(filters.brand)) +
    Number(filters.maxPrice < 100000);
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => setFilters(createDefaultFilters());
  const clearSearch = () => setFilters((current) => ({ ...current, search: "" }));
  const clearCategory = () => setFilters((current) => ({ ...current, categoryId: "" }));
  const clearBrand = () => setFilters((current) => ({ ...current, brand: "" }));
  const clearPrice = () => setFilters((current) => ({ ...current, maxPrice: 100000 }));

  const activeFilters: ActiveFilter[] = [
    filters.search.trim()
      ? {
          key: "search",
          label: `Recherche: ${filters.search.trim()}`,
          clear: clearSearch,
        }
      : null,
    filters.categoryId
      ? {
          key: "category",
          label: categories.find((category) => category.id === filters.categoryId)?.name ?? "Catégorie",
          clear: clearCategory,
        }
      : null,
    filters.brand
      ? {
          key: "brand",
          label: filters.brand,
          clear: clearBrand,
        }
      : null,
    filters.maxPrice < 100000
      ? {
          key: "price",
          label: `Max ${filters.maxPrice.toLocaleString("fr-FR")} FCFA`,
          clear: clearPrice,
        }
      : null,
  ].filter(Boolean) as ActiveFilter[];

  return (
    <div className="container-safe space-y-8 py-6">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-black/10 bg-[#0b0c12] px-5 py-8 text-white shadow-[0_30px_90px_rgba(15,15,20,0.18)] sm:px-8 sm:py-10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,137,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,12,18,0.82),rgba(15,18,28,0.55))]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/assets/home/catalogue.png')" }}
          />
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-white/55">Catalogue</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Trouvez vite le bon produit.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Une mise en page plus lisible avec la recherche dans l’en-tête et les filtres placés à gauche pour comparer
              sans effort.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/65 backdrop-blur-sm">
                {resultLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/65 backdrop-blur-sm">
                {categories.length} catégories
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/65 backdrop-blur-sm">
                {brands.length} marques
              </span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/cart" className="btn-base bg-white px-5 py-3 text-black">
                Voir le panier
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/55">
              <SlidersHorizontal className="h-4 w-4" />
              Recherche
            </div>
            <label className="mt-3 flex items-center gap-3 rounded-[1.4rem] border border-white/15 bg-white/95 px-4 py-3 text-black shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-black/45" />
              <input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Rechercher une chemise, une sneaker ou une marque..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
              />
              {filters.search ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-full p-1.5 text-black/45 transition hover:bg-black/5 hover:text-black"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
            <p className="mt-3 text-xs leading-6 text-white/55">
              La recherche reste en haut, les filtres complètent à gauche.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="btn-base mt-4 border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters
            categories={categories}
            brands={brands}
            value={filters}
            onChange={setFilters}
            showSearch={false}
          />
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Résultats</p>
              <h2 className="section-title">{resultLabel}</h2>
              <p className="text-sm text-black/55">
                {hasActiveFilters
                  ? `${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""} appliqué${activeFilterCount > 1 ? "s" : ""}`
                  : "Parcourez toute la sélection ou affinez votre recherche."}
              </p>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-base border border-black/10 bg-black px-4 py-3 text-sm text-white"
              >
                Tout réinitialiser
              </button>
            ) : null}
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5"
                >
                  <span>{filter.label}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex justify-center rounded-[2rem] border border-black/10 bg-white p-10 shadow-sm">
              <Loader className="py-6" />
            </div>
          ) : (
            <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm sm:p-5">
              <ProductGrid
                products={products}
                emptyMessage="Aucun produit ne correspond à ces filtres. Essayez d’élargir votre recherche."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
