"use client";

import type { ReactNode } from "react";
import { Category } from "@/types/product";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/utils/cn";

type ProductFiltersValue = {
  search: string;
  categoryId: string;
  brand: string;
  maxPrice: number;
};

type ProductFiltersProps = {
  categories: Category[];
  brands: string[];
  value: ProductFiltersValue;
  onChange: (next: ProductFiltersValue) => void;
  showSearch?: boolean;
};

function FilterSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.25em] text-black/45">Recherche</span>
      <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-black/45" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Rechercher un produit"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full p-1.5 text-black/45 transition hover:bg-black/5 hover:text-black"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </label>
  );
}

function FilterButton({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition",
        active
          ? "border-black bg-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
          : "border-black/10 bg-white text-black hover:border-black/20 hover:bg-black/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function FilterBody({
  categories,
  brands,
  value,
  onChange,
  showSearch,
}: ProductFiltersProps) {
  const availableCategories = categories ?? [];
  const clearFilters = () =>
    onChange({
      search: "",
      categoryId: "",
      brand: "",
      maxPrice: 100000,
    });

  return (
    <div className="space-y-6 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/55">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
          </div>
          <h3 className="text-lg font-semibold tracking-tight">Affiner la sélection</h3>
          <p className="text-sm leading-6 text-black/55">
            Choisissez une catégorie, une marque ou un budget.
          </p>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="btn-base border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold text-black hover:bg-black/10"
        >
          Réinitialiser
        </button>
      </div>

      {showSearch ? (
        <FilterSearch
          value={value.search}
          onChange={(next) => onChange({ ...value, search: next })}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Catégories</p>
          <span className="text-xs text-black/40">{availableCategories.length} choix</span>
        </div>

        <div className="space-y-2">
          <FilterButton
            active={!value.categoryId}
            onClick={() => onChange({ ...value, categoryId: "" })}
          >
            <span>Toutes les catégories</span>
            <span className="rounded-full border border-current/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] opacity-80">
              Tout
            </span>
          </FilterButton>

          {availableCategories.length > 0 ? (
            availableCategories.map((category) => (
              <FilterButton
                key={category.id}
                active={value.categoryId === category.id}
                onClick={() => onChange({ ...value, categoryId: category.id })}
              >
                <span className="truncate">{category.name}</span>
                <span className="rounded-full border border-current/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] opacity-80">
                  Cat.
                </span>
              </FilterButton>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black/45">
              Aucune catégorie disponible.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Marques</p>
          <span className="text-xs text-black/40">{brands.length} choix</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...value, brand: "" })}
            className={cn(
              "btn-base border px-4 py-2 text-xs font-semibold",
              !value.brand
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white text-black hover:bg-black/5",
            )}
          >
            Toutes
          </button>

          {brands.length > 0 ? (
            brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => onChange({ ...value, brand })}
                className={cn(
                  "btn-base border px-4 py-2 text-xs font-semibold",
                  value.brand === brand
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:bg-black/5",
                )}
              >
                {brand}
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black/45">
              Aucune marque disponible.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Prix maximum</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            {value.maxPrice.toLocaleString("fr-FR")} FCFA
          </span>
        </div>

        <input
          type="range"
          min={10000}
          max={100000}
          step={1000}
          value={value.maxPrice}
          onChange={(event) => onChange({ ...value, maxPrice: Number(event.target.value) })}
          className="w-full accent-black"
        />

        <p className="text-xs leading-6 text-black/45">
          Gardez un budget lisible pour parcourir le catalogue plus vite.
        </p>
      </section>
    </div>
  );
}

export function ProductFilters({
  categories,
  brands,
  value,
  onChange,
  showSearch = true,
}: ProductFiltersProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
      <div className="sm:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-black/10 px-4 py-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/55">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtres
              </div>
              <p className="text-sm font-medium text-black/75">Ouvrir les options</p>
            </div>
            <ChevronDown className="h-4 w-4 text-black/45 transition group-open:rotate-180" />
          </summary>
          <FilterBody
            categories={categories}
            brands={brands}
            value={value}
            onChange={onChange}
            showSearch={showSearch}
          />
        </details>
      </div>

      <div className="hidden sm:block">
        <FilterBody
          categories={categories}
          brands={brands}
          value={value}
          onChange={onChange}
          showSearch={showSearch}
        />
      </div>
    </div>
  );
}
