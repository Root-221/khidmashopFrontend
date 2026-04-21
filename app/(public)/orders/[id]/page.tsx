"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Clock, MapPin, Package2, Phone, User, X, Download } from 'lucide-react';
import { getOrderById, cancelOrder } from '@/services/order.service';
import { generateInvoicePdf } from '@/utils/pdf';
import { Order } from '@/types/order';
import { formatCurrency, formatDate, orderLabel, orderStatusLabel } from '@/utils/format';
import { statusTone } from '@/utils/identity';
import { Loader } from '@/components/ui/Loader';
import { useOrderStore } from '@/stores/useOrderStore';

const CANCEL_WINDOW_MS = 30 * 60 * 1000;

function getRemainingMs(createdAt: string): number {
  return Math.max(0, CANCEL_WINDOW_MS - (Date.now() - new Date(createdAt).getTime()));
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  const updateOrder = useOrderStore((state) => state.updateOrder);
  const [remainingMs, setRemainingMs] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canCancel = order?.status === 'PENDING' && remainingMs > 0;

  useEffect(() => {
    if (!order) return;
    setRemainingMs(getRemainingMs(order.createdAt));
  }, [order]);

  useEffect(() => {
    if (!order || order.status !== 'PENDING' || remainingMs <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemainingMs(getRemainingMs(order!.createdAt));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order, remainingMs]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId, order!.phone),
    onSuccess: (updated: Order) => {
      updateOrder(updated);
      router.back();
    },
  });

  const handleDownload = () => {
    if (order) generateInvoicePdf(order);
  };

  if (isLoading) {
    return (
      <div className="container-safe py-6">
        <Loader className="py-10" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-6 text-sm text-black/55">
          Commande non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="container-safe space-y-6 py-6 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-base border border-black/10 bg-white px-4 py-2 text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.4em] text-black/40">Commande</p>
          <h1 className="text-xl font-bold tracking-tight">{orderLabel(order)}</h1>
        </div>
        <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Client info */}
        <div className="rounded-2xl border border-black/8 bg-black/[0.02] p-4 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-black/40">Informations client</p>
          <div className="flex items-center gap-2.5 text-sm">
            <User className="h-4 w-4 shrink-0 text-black/35" />
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-black/35" />
            <span className="text-black/70">{order.phone}</span>
          </div>
          {order.address && (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-black/35" />
              <span className="text-black/70">{order.address}</span>
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-black/40">
            Articles ({order.items.length})
          </p>
          <div className="divide-y divide-black/6 overflow-hidden rounded-2xl border border-black/8">
{order.items.map((item: any) => {
              const image = item.productSnapshot?.image || item.product?.images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-3 bg-white px-4 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/8 bg-black/5">
                    {image ? (
                      <img src={image} alt={item.productSnapshot.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package2 className="h-5 w-5 text-black/20" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productSnapshot.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-black/50">
                      {item.size && <span>Taille : {item.size}</span>}
                      {item.color && <span>Couleur : {item.color}</span>}
                      <span>Qté : {item.quantity}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.productSnapshot.price * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-black/40">{formatCurrency(item.productSnapshot.price)} / u</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-2xl bg-black px-5 py-4">
          <p className="text-sm font-medium text-white/70">Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(order.total)}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm font-semibold shadow-sm transition hover:border-black hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Télécharger la facture
          </button>
          
          {order.status === 'PENDING' && (
            canCancel ? (
              confirming ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="flex-1 rounded-2xl bg-red-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {cancelMutation.isPending ? 'Annulation...' : 'Oui, annuler'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={cancelMutation.isPending}
                    className="flex-1 rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm font-semibold transition hover:border-black/30 disabled:opacity-60"
                  >
                    Non, garder
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
                  <Clock className="h-4 w-4" />
                  <span>Annulation possible encore <strong>{formatCountdown(remainingMs)}</strong></span>
                  <button
                    onClick={() => setConfirming(true)}
                    className="mt-1 w-full rounded-xl bg-white/50 px-4 py-1.5 font-semibold transition hover:bg-white"
                  >
                    <X className="mr-1.5 inline h-3.5 w-3.5" />
                    Annuler
                  </button>
                </div>
              )
            ) : (
              <p className="text-center text-sm text-black/40 py-6">
                Délai d&#39;annulation (30min) dépassé.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
