"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, TrendingUp, Clock, CheckCircle, AlertCircle, Eye, FileText, Printer, MessageCircle, MapPin, Edit } from "lucide-react";
import { listOrders, listOrderStats, updateOrderStatus } from "@/services/order.service";
import { Modal } from "@/components/ui/Modal";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { formatCurrency, formatDate, orderStatusLabel } from "@/utils/format";
import { statusTone } from "@/utils/identity";
import { generateInvoicePdf } from "@/utils/pdf";

const statusIcons = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <TrendingUp className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ 
    queryKey: ["admin-orders"], 
    queryFn: () => listOrders() 
  });
  
  const { data: stats } = useQuery({ 
    queryKey: ["admin-order-stats"], 
    queryFn: () => listOrderStats() 
  });

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const filteredOrders = useMemo(() => {
    if (!filter) return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: "PENDING" | "CONFIRMED" | "DELIVERED" }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
      setShowOrderDetails(false);
    },
  });

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const shareLocationOnWhatsApp = (order: any) => {
    if (!order.latitude || !order.longitude) return;

    const message = `📍 Localisation du client pour la commande #${order.id}\\n\\n👤 Client: ${order.customerName}\\n📞 Téléphone: ${order.phone || 'N/A'}\\n📍 Adresse: ${order.address || 'N/A'}\\n\\n📦 Commande: ${order.items.length} article(s)\\n💰 Total: ${formatCurrency(order.total)}\\n\\nStatut: ${orderStatusLabel(order.status)}\\n\\n📍 Coordonnées GPS:\\nLatitude: ${order.latitude}\\nLongitude: ${order.longitude}\\n\\n🗺️ Google Maps: https://maps.google.com/?q=${order.latitude},${order.longitude}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const printInvoice = (order: any) => {
    generateInvoicePdf(order);
  };

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + (order.total || 0), 0), [orders]);

  const statusOptions = [
    { status: "all", label: "Toutes", count: orders.length },
    { status: "PENDING", label: "En attente", count: orders.filter((o) => o.status === "PENDING").length },
    { status: "CONFIRMED", label: "Confirmées", count: orders.filter((o) => o.status === "CONFIRMED").length },
    { status: "DELIVERED", label: "Livrées", count: orders.filter((o) => o.status === "DELIVERED").length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <AdminHeader
        icon={<ShoppingCart className="h-5 w-5" />}
        title="Commandes"
        description="Gérez toutes les commandes de votre boutique"
        breadcrumbs={[{ label: "Accueil" }, { label: "Commandes" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard
          label="Chiffre d'affaires"
          value={formatCurrency(revenue)}
          icon={<ShoppingCart className="h-4 w-4" />}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <AdminStatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          color="blue"
        />
        <AdminStatCard
          label="En attente"
          value={stats?.pending ?? 0}
          icon={<Clock className="h-4 w-4" />}
          color="orange"
        />
        <AdminStatCard
          label="Livrées"
          value={stats?.delivered ?? 0}
          icon={<CheckCircle className="h-4 w-4" />}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.status}
            onClick={() => setFilter(option.status === "all" ? null : option.status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              (filter === null && option.status === "all") || filter === option.status
                ? "bg-black text-white"
                : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <AdminCard>
        <h3 className="text-lg font-bold text-black mb-6">Liste des commandes</h3>
        <AdminDataDisplay
          data={filteredOrders}
          isLoading={isLoading}
          itemsPerPage={8}
          defaultView="list"
          emptyMessage="Aucune commande trouvée"
          renderGrid={(orders) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-4 rounded-lg border border-black/20 bg-white hover:bg-black/5 transition-colors cursor-pointer" 
                  onClick={() => openOrderDetails(order)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-black">{order.customerName}</p>
                      <p className="text-xs text-black/60">{order.items.length} article(s)</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusTone(order.status)}`}>
                      {statusIcons[order.status as keyof typeof statusIcons]}
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-black/60">{formatDate(order.createdAt)}</p>
                    <p className="font-bold text-black">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          renderList={(orders) => (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-black">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-black hidden md:table-cell">Articles</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-black">Montant</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-black">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-black hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-black/2.5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-black">{order.customerName}</p>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <p className="text-sm text-black/60">{order.items.length} article(s)</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-semibold text-black">{formatCurrency(order.total)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusTone(order.status)}`}>
                          {statusIcons[order.status as keyof typeof statusIcons]}
                          {orderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-black/60 hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </AdminCard>

      {/* Order Details Modal */}
      <Modal open={showOrderDetails} onClose={() => setShowOrderDetails(false)} title={`Commande #${selectedOrder?.id || ''}`}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-black/5 to-black/2 border border-black/10">
              <div>
                <p className="text-xs uppercase tracking-wider text-black/60 font-semibold">Statut commande</p>
                <p className="text-sm text-black/60 mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusTone(selectedOrder.status)}`}>
                {statusIcons[selectedOrder.status as keyof typeof statusIcons]}
                {orderStatusLabel(selectedOrder.status)}
              </span>
            </div>

            {/* Client & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client */}
              <div className="p-4 rounded-lg border border-black/10 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-black">
                      {selectedOrder.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-black">Client</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-black/60 font-medium uppercase">Nom</p>
                    <p className="text-base font-semibold text-black">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 font-medium uppercase">Téléphone</p>
                    <p className="text-base font-semibold text-black">{selectedOrder.phone || 'N/A'}</p>
                  </div>
                  {selectedOrder.address && (
                    <div>
                      <p className="text-xs text-black/60 font-medium uppercase">Adresse</p>
                      <p className="text-base font-semibold text-black">{selectedOrder.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-lg border border-black/10 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="font-semibold text-lg text-black">Résumé</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-black/60 font-medium uppercase">Articles</p>
                    <p className="text-2xl font-bold text-black">{selectedOrder.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 font-medium uppercase">Total TTC</p>
                    <p className="text-3xl font-bold text-black">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location (if available) */}
            {selectedOrder.latitude && selectedOrder.longitude && (
              <div className="p-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-green-900 mb-3">📍 Localisation Client</h3>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-4 border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Latitude:</span>
                          <span className="ml-2">{selectedOrder.latitude.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Longitude:</span>
                          <span className="ml-2">{selectedOrder.longitude.toFixed(6)}</span>
                        </div>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-green-700 hover:text-green-900 font-semibold text-sm underline"
                      >
                        Ouvrir Google Maps →
                      </a>
                    </div>
                    <button
                      onClick={() => shareLocationOnWhatsApp(selectedOrder)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Partager sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div>
              <h3 className="font-bold text-xl text-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-lg">
                  📦
                </div>
                Articles de la commande
              </h3>
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-black/10 bg-white hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-black">{item.product.name}</p>
                      <p className="text-sm text-black/70 mt-1">
                        Quantité: <span className="font-bold text-black">{item.quantity}</span> × {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-black">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-black/10">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-black/70 font-medium">Sous-total</span>
                  <span className="font-semibold text-black">{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-black/20">
                  <span className="text-2xl font-bold text-black">TOTAL</span>
                  <span className="text-3xl font-bold text-black">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-black/10 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-lg font-bold bg-black text-white hover:bg-black/90 transition-all shadow-lg hover:shadow-2xl h-full"
                >
                  <Printer className="h-5 w-5" />
                  Imprimer Facture
                </button>

                {selectedOrder.latitude && selectedOrder.longitude && (
                  <button
                    onClick={() => shareLocationOnWhatsApp(selectedOrder)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg hover:shadow-xl h-full"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Localisation
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-black min-w-0 flex-shrink-0">Changer statut:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const status = e.target.value as "PENDING" | "CONFIRMED" | "DELIVERED";
                    updateStatusMutation.mutate({ orderId: selectedOrder.id, status });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl text-lg font-semibold bg-white text-black border-2 border-black/20 focus:border-black focus:outline-none transition-all shadow-sm hover:shadow-md"
                >
                  <option value="PENDING">⏳ En attente</option>
                  <option value="CONFIRMED">✅ Confirmée</option>
                  <option value="DELIVERED">📦 Livrée</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
