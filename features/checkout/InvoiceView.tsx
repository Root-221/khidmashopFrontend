"use client";

import { Order } from "@/types/order";
import { formatCurrency, formatDate, orderLabel } from "@/utils/format";
import { generateInvoicePdf } from "@/utils/pdf";
import { statusTone } from "@/utils/identity";
import { Download, Receipt, MapPin, Phone, Mail, Clock, Package } from "lucide-react";

type InvoiceViewProps = {
  order: Order;
};

export function InvoiceView({ order }: InvoiceViewProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="card-base overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5">
      {/* Header */}
      <div className="bg-black px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Receipt className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">Facture</p>
              <h2 className="text-xl font-bold text-white">KHIDMA SHOP</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => generateInvoicePdf(order)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Info principale */}
      <div className="grid divide-x divide-black/10 bg-black/[0.02] md:grid-cols-3">
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-black/40">
            <Receipt className="h-3 w-3" />
            Référence
          </div>
          <p className="mt-1 font-mono text-sm font-semibold text-black">{order.id.substring(0, 12).toUpperCase()}</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-black/40">
            <Clock className="h-3 w-3" />
            Date
          </div>
          <p className="mt-1 text-sm font-semibold text-black">{formatDate(order.createdAt)}</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-black/40">
            <Package className="h-3 w-3" />
            Articles
          </div>
          <p className="mt-1 text-sm font-semibold text-black">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid md:grid-cols-2">
        {/* Émetteur */}
        <div className="border-b border-black/10 p-5 md:border-b-0 md:border-r">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">Émetteur</p>
          <div className="space-y-2">
            <p className="font-semibold text-black">Khidma Shop</p>
            <div className="flex items-start gap-2 text-sm text-black/60">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Rufisque, Tally Bou Bess<br />près Usine vinaigre</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-black/60">
              <Mail className="h-4 w-4" />
              <span>bakarydiassy28@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-black/60">
              <Phone className="h-4 w-4" />
              <span>+221 77 862 70 52</span>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="p-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">Client</p>
          <div className="space-y-2">
            <p className="font-semibold text-black">{order.customerName}</p>
            <div className="flex items-center gap-2 text-sm text-black/60">
              <Phone className="h-4 w-4" />
              <span>{order.phone}</span>
            </div>
            {order.address && (
              <div className="flex items-start gap-2 text-sm text-black/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{order.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tableau produits */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="bg-black/5 text-[10px] font-semibold uppercase tracking-[0.3em] text-black/50">
              <th className="px-5 py-4 text-left">Désignation</th>
              <th className="px-5 py-4 text-center">Qté</th>
              <th className="px-5 py-4 text-right">Prix unitaire</th>
              <th className="px-5 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {order.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-black/[0.02]'}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.productSnapshot.image && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-black/10">
                        <img 
                          src={item.productSnapshot.image} 
                          alt={item.productSnapshot.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-black">{item.productSnapshot.name}</p>
                      <p className="text-xs text-black/50">
                        {item.size && `Taille: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Couleur: ${item.color}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black/10 px-2 text-xs font-semibold">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-black/60">
                  {formatCurrency(item.productSnapshot.price)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-black">
                  {formatCurrency(item.productSnapshot.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end border-t border-black/10 bg-black/[0.02] p-5">
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between rounded-xl bg-black px-4 py-3">
            <span className="text-sm font-medium text-white/80">Total</span>
            <span className="text-xl font-bold text-white">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-black/10 bg-black/5 px-5 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
          <p className="text-xs text-black/50">Merci pour votre confiance !</p>
          <p className="text-xs text-black/40">Facture générée le {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
}