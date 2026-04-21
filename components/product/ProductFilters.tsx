"use client";

import { Category } from "@/types/product";
import { ChevronDown, Search, X } from "lucide-react";
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

export function ProductFilters({ categories, brands, value, onChange, showSearch = true }: ProductFiltersProps) {
  const availableCategories = categories ?? [];
  const FilterContent = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn("space-y-4", compact ? "pt-4" : "")}>
      {showSearch ? (
        <div className={cn("grid gap-3", compact ? "grid-cols-1 sm:grid-cols-[1fr_auto]" : "sm:flex sm:flex-row sm:items-center")}>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 sm:left-4" />
            <input
              value={value.search}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
              placeholder="Rechercher un produit"
              className={cn("input-base pl-10 sm:pl-11", compact && "py-2.5 text-sm")}
            />
          </label>

          <button
            type="button"
            onClick={() => onChange({ search: "", categoryId: "", brand: "", maxPrice: 100000 })}
            className={cn(
              "btn-base border border-black/10 bg-white text-sm",
              compact ? "px-3 py-2.5" : "px-4 py-3",
            )}
          >
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">Catégories</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onChange({ ...value, categoryId: "" })}
              className={cn(
                "btn-base shrink-0 border px-3 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-xs",
                !value.categoryId ? "border-black bg-black text-white" : "border-black/10 bg-white",
              )}
            >
              Toutes
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange({ ...value, categoryId: category.id })}
                className={cn(
                  "btn-base shrink-0 border px-3 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-xs",
                  value.categoryId === category.id ? "border-black bg-black text-white" : "border-black/10 bg-white",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Marques</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onChange({ ...value, brand: "" })}
              className={cn(
                "btn-base shrink-0 border px-3 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-xs",
                !value.brand ? "border-black bg-black text-white" : "border-black/10 bg-white",
              )}
            >
              Toutes
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => onChange({ ...value, brand })}
                className={cn(
                  "btn-base shrink-0 border px-3 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-xs",
                  value.brand === brand ? "border-black bg-black text-white" : "border-black/10 bg-white",
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-2 rounded-2xl border border-black/10 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.25em] text-black/45">Prix maximum</span>
            <span className="text-sm font-medium">{value.maxPrice.toLocaleString("fr-FR")} FCFA</span>
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
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-0 rounded-3xl border border-black/10 bg-white p-3 sm:space-y-4 sm:p-4">
      <div className="sm:hidden">
        <details className="group rounded-2xl border border-black/10 bg-white p-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
            <span>Filtres</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <FilterContent compact />
        </details>
      </div>

      <div className="hidden sm:block">
        <FilterContent />
      </div>
    </div>
  );
}
