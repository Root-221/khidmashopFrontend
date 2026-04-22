"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, LogIn, ShoppingBag } from "lucide-react";
import { searchOrdersByPhone } from "@/services/order.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUiStore } from "@/stores/useUiStore";
import { Order } from "@/types/order";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency, formatDate, orderLabel, orderStatusLabel } from "@/utils/format";
import { statusTone } from "@/utils/identity";
import { useToast } from "@/hooks/useToast";

export default function OrdersPage() {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const openLoginModal = useUiStore((state) => state.openLoginModal);
  
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrders = useCallback(async (phoneToSearch: string) => {
    setIsLoading(true);
    try {
      const data = await searchOrdersByPhone(phoneToSearch);
      setOrders(data);
      setHasSearched(true);
    } catch (error) {
      toast.error("Erreur", "Impossible de récupérer vos commandes");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchOrders(user.phone);
    } else {
      setOrders([]);
      setHasSearched(false);
    }
  }, [user, fetchOrders]);

  return (
    <div className="container-safe space-y-6 py-6 pb-20">
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-black/40">Compte</p>
        <h1 className="text-2xl font-bold tracking-tight">Mes Commandes</h1>
      </div>

      {!user ? (
        <div className="card-base p-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black">
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Connexion requise</h2>
            <p className="text-sm text-black/50 max-w-[280px] mx-auto">
              Connectez-vous avec votre numéro et votre code PIN pour voir votre historique de commandes.
            </p>
          </div>
          <button 
            onClick={openLoginModal}
            className="btn-base bg-black px-8 py-4 text-white hover:scale-105 active:scale-95 transition-all"
          >
            Se connecter maintenant
          </button>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="py-20">
              <Loader label="Récupération de vos commandes..." />
            </div>
          )}

          {!isLoading && hasSearched && orders.length === 0 && (
            <div className="card-base p-16 text-center space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/5">
                <ShoppingBag className="h-10 w-10 text-black/10" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold">Aucune commande trouvée</p>
                <p className="text-sm text-black/50">Vous n&apos;avez pas encore passé de commande avec ce compte.</p>
              </div>
              <Link href="/products" className="btn-base inline-block bg-black px-8 py-4 text-white">
                Découvrir le catalogue
              </Link>
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {orders.map((order: Order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="card-base group overflow-hidden border border-black/5 hover:border-black transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusTone(order.status)}`}>
                          {orderStatusLabel(order.status)}
                        </span>
                        <h3 className="font-bold text-lg">{orderLabel(order)}</h3>
                        <p className="text-xs text-black/40">{formatDate(order.createdAt)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-black/20 group-hover:text-black transition-colors" />
                    </div>
                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                      <p className="text-sm font-medium text-black/40">{order.items.length} article(s)</p>
                      <p className="font-black text-xl">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}