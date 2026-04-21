"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowRight, Box, ClipboardList, Users2, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";
import { listProducts, listProductStats } from "@/services/product.service";
import { listOrderStats, listOrders } from "@/services/order.service";
import { listUserStats } from "@/services/user.service";
import { listCategories } from "@/services/category.service";
import { formatCurrency, formatDate, orderStatusLabel } from "@/utils/format";
import { Loader } from "@/components/ui/Loader";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { statusTone } from "@/utils/identity";

export default function AdminDashboardPage() {
  const { data: productStats } = useQuery({ queryKey: ["admin-product-stats"], queryFn: listProductStats });
  const { data: orderStats } = useQuery({ queryKey: ["admin-order-stats"], queryFn: listOrderStats });
  const { data: userStats } = useQuery({ queryKey: ["admin-user-stats"], queryFn: listUserStats });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products-sample"],
    queryFn: () => listProducts(),
  });
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ 
    queryKey: ["admin-orders-sample"], 
    queryFn: listOrders 
  });
  const { data: categories = [] } = useQuery({ 
    queryKey: ["admin-categories-sample"], 
    queryFn: () => listCategories() 
  });

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + (order.total || 0), 0), [orders]);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <AdminHeader
        icon={<TrendingUp className="h-5 w-5" />}
        title="Dashboard"
        description="Vue d'ensemble de votre boutique en temps réel"
        breadcrumbs={[{ label: "Accueil" }]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Chiffre d'affaires"
          value={formatCurrency(revenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <AdminStatCard
          label="Commandes"
          value={orderStats?.total ?? 0}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <AdminStatCard
          label="Clients"
          value={userStats?.total ?? 0}
          icon={<Users2 className="h-5 w-5" />}
          color="purple"
          trend={{ value: 5, isPositive: true }}
        />
        <AdminStatCard
          label="Produits"
          value={productStats?.total ?? 0}
          icon={<Box className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/60 font-medium">En attente</p>
              <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
            </div>
            <div className="text-4xl font-bold text-yellow-500/20">!</div>
          </div>
        </AdminCard>
        <AdminCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/60 font-medium">Livrées</p>
              <p className="text-3xl font-bold mt-2">{deliveredOrders}</p>
            </div>
            <div className="text-4xl font-bold text-green-500/20">✓</div>
          </div>
        </AdminCard>
        <AdminCard hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/60 font-medium">Catégories</p>
              <p className="text-3xl font-bold mt-2">{categories.length}</p>
            </div>
            <div className="text-4xl font-bold text-blue-500/20">#</div>
          </div>
        </AdminCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Section */}
        <div className="lg:col-span-2">
          <AdminCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-black">Commandes récentes</h3>
                <p className="text-sm text-black/60 mt-1">Suivi des dernières commandes</p>
              </div>
              <Link 
                href="/admin/orders"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-black/10 hover:bg-black/2.5 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-black truncate">{order.customerName}</p>
                      <div className="flex gap-4 mt-1 text-sm text-black/60">
                        <span>{order.items.length} article(s)</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-black">{formatCurrency(order.total)}</p>
                    <p className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${statusTone(order.status)}`}>
                      {orderStatusLabel(order.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-black/50">Aucune commande</p>
            )}
          </AdminCard>
        </div>

        {/* Products Section */}
        <div>
          <AdminCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-black">Produits</h3>
                <p className="text-sm text-black/60 mt-1">Derniers ajouts</p>
              </div>
              <Link 
                href="/admin/products"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-3">
                {products.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/admin/products?id=${product.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-black/10 hover:bg-black/2.5 cursor-pointer transition-colors">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10">
                        <Image 
                          src={product.images[0]} 
                          alt={product.name} 
                          fill 
                          className="object-cover" 
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate text-black">{product.name}</p>
                        <p className="text-xs text-black/60">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-black/50">Aucun produit</p>
            )}
          </AdminCard>
        </div>
      </div>

    </div>
  );
}
