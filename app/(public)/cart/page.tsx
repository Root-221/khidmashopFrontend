"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency } from "@/utils/format";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotal);

  return (
    <div className="container-safe space-y-6 py-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Panier</p>
        <h1 className="section-title">Vos articles</h1>
      </div>

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="card-base flex gap-3 p-3 sm:p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/5">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-sm font-medium">{item.product.name}</h2>
                    <p className="mt-1 text-xs text-black/55">
                      {item.size ?? "-"} • {item.color ?? "-"}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{formatCurrency(item.product.price)}</p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-2 text-black/45 hover:bg-black/5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-black/10 p-1">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-full p-2 hover:bg-black/5">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-full p-2 hover:bg-black/5">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card-base p-8 text-center">
            <p className="text-sm text-black/60">Votre panier est vide.</p>
            <Link href="/products" className="btn-base mt-4 bg-black px-4 py-3 text-white">
              Découvrir les produits
            </Link>
          </div>
        )}
      </div>

      {items.length ? (
        <div className="space-y-3">
          <div className="card-base flex items-center justify-between px-4 py-4">
            <span className="text-sm text-black/55">Total</span>
            <span className="text-xl font-semibold">{formatCurrency(subtotal())}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="btn-base border border-black/10 bg-white px-4 py-3"
            >
              Catalogue
            </button>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="btn-base bg-black px-4 py-3 text-white"
            >
              Commander
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
