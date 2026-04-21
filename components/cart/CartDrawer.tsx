"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useUiStore } from "@/stores/useUiStore";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import { useToast } from "@/hooks/useToast";

export function CartDrawer() {
  const open = useUiStore((state) => state.cartDrawerOpen);
  const closeCartDrawer = useUiStore((state) => state.closeCartDrawer);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotal);
  const toast = useToast();

  const isCartEmpty = items.length === 0;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/45" onClick={closeCartDrawer}>
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/45">Panier</p>
                <h2 className="text-lg font-semibold">Votre sélection</h2>
              </div>
              <button type="button" onClick={closeCartDrawer} className="rounded-full p-2 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-3xl border border-black/10 p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black/5">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium">{item.product.name}</p>
                          <p className="mt-1 text-xs text-black/55">
                            {item.size ?? "-"} • {item.color ?? "-"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                            toast.info("Produit supprimé");
                          }}
                          className="rounded-full p-2 text-black/45 hover:bg-black/5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-black/10 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="rounded-full p-1.5 hover:bg-black/5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="rounded-full p-1.5 hover:bg-black/5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center text-sm text-black/55">
                  Votre panier est vide.
                </div>
              )}
            </div>

            <div className="border-t border-black/10 p-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-black/55">Sous-total</span>
                <span className="font-semibold">{formatCurrency(subtotal())}</span>
              </div>
              <div className="grid gap-2">
                <Link
                  href={isCartEmpty ? "#" : "/checkout"}
                  onClick={(event) => {
                    if (isCartEmpty) {
                      event.preventDefault();
                      event.stopPropagation();
                      toast.info("Ajoutez un article pour commander");
                      return;
                    }
                    closeCartDrawer();
                  }}
                  className={cn(
                    "btn-base px-4 py-3 text-white transition",
                    isCartEmpty ? "bg-black/40 pointer-events-auto" : "bg-black",
                  )}
                  aria-disabled={isCartEmpty}
                >
                  Commander
                </Link>
                <button type="button" onClick={closeCartDrawer} className="btn-base border border-black/10 bg-white px-4 py-3">
                  Continuer vos achats
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
