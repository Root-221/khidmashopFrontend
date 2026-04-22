import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products, emptyMessage }: ProductGridProps & { emptyMessage?: string }) {
  if (!products.length) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-dashed border-black/10 py-12 text-center text-black/45">
        <p className="text-sm font-medium">{emptyMessage || "Aucun produit ne correspond à votre recherche."}</p>
        <p className="text-xs">Explorez nos autres catégories ou modifiez vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
