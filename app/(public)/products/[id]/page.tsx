"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { getProductById, listProducts } from "@/services/product.service";
import { Loader } from "@/components/ui/Loader";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCartStore } from "@/stores/useCartStore";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId as string),
    enabled: Boolean(productId),
  });
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.id, product?.categoryId, product?.brand],
    queryFn: async () => {
      if (!product) return [];
      const allProducts = await listProducts();
      return allProducts
        .filter((item) => item.id !== product.id)
        .filter((item) => item.categoryId === product.categoryId || item.brand === product.brand)
        .slice(0, 4);
    },
    enabled: Boolean(product),
  });
  const addItem = useCartStore((state) => state.addItem);
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const defaultSelections = useMemo(() => {
    if (!product) return { size: "", color: "" };
    return { size: product.sizes[0] ?? "", color: product.colors[0] ?? "" };
  }, [product]);

  if (isLoading) {
    return (
      <div className="container-safe py-6">
        <Loader className="py-10" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-safe py-6">
        <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center">
          <p className="text-sm text-black/60">Produit introuvable.</p>
          <button onClick={() => router.push("/products")} className="mt-4 btn-base border border-black/10 bg-white px-4 py-3">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const activeSize = selectedSize || defaultSelections.size;
  const activeColor = selectedColor || defaultSelections.color;
  const canAdd = Boolean(product && activeSize && activeColor);

  return (
    <div className="container-safe space-y-6 py-6">
      <button onClick={() => router.push("/products")} className="btn-base border border-black/10 bg-white px-4 py-2 text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(product.price)}</p>
          </div>

          <p className="text-sm leading-6 text-black/65">{product.description}</p>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Tailles</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "btn-base border px-4 py-2 text-sm",
                    activeSize === size ? "border-black bg-black text-white" : "border-black/10 bg-white",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Couleurs</h2>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "btn-base border px-4 py-2 text-sm",
                    activeColor === color ? "border-black bg-black text-white" : "border-black/10 bg-white",
                  )}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs text-black/45">Stock</p>
              <p className="mt-1 font-semibold">{product.stock}</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs text-black/45">Note</p>
              <p className="mt-1 font-semibold">{product.rating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-3">
              <p className="text-xs text-black/45">Catégorie</p>
              <p className="mt-1 line-clamp-1 font-semibold">{product.categoryName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-base space-y-4 p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">Sélection</p>
          <p className="truncate text-sm text-black/65">
            {activeSize || "Taille"} • {activeColor || "Couleur"}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              addItem(product, { size: activeSize, color: activeColor });
              toast.success("Ajouté au panier", product.name);
            }}
            disabled={!canAdd}
            className="btn-base w-full bg-black px-5 py-3 text-white"
          >
            Ajouter au panier
          </button>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="btn-base w-full border border-black/10 bg-white px-5 py-3"
          >
            Voir le panier
          </button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">Suggestions</p>
            <h2 className="section-title">Produits similaires</h2>
          </div>
          <p className="text-sm text-black/55">Même univers, même style</p>
        </div>
        {relatedProducts.length ? (
          <ProductGrid products={relatedProducts} />
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center text-sm text-black/55">
            Aucun produit similaire pour le moment.
          </div>
        )}
      </section>
    </div>
  );
}
