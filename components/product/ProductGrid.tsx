import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="card-base p-8 text-center text-sm text-black/55">
        Aucun produit ne correspond à votre recherche.
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
