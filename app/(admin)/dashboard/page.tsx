"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

const stats = [
  { title: "Commandes du jour", value: "12", change: "+3%", icon: "📦" },
  { title: "Revenus 24h", value: "2,450 FCFA", change: "+12%", icon: "💰" },
  { title: "Produits en stock", value: "156", change: "-2%", icon: "📱" },
  { title: "Nouveaux clients", value: "8", change: "+25%", icon: "👥" },
];

export default function AdminDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white text-black">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 overflow-auto">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-4 border-b border-black/10 sticky top-0 bg-white z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          <AdminPageHeader 
            eyebrow="Accueil"
            title="Dashboard" 
            description="Bienvenue dans votre panneau d'administration KHIDMA"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            {stats.map((stat, index) => (
              <AdminStatCard 
                key={index} 
                label={stat.title} 
                value={stat.value} 
                trend={{ value: parseInt(stat.change), isPositive: stat.change.startsWith('+') }}
              />
            ))}
          </div>

          <div className="mt-12 p-6 border border-black/10 rounded-xl bg-white">
            <h3 className="text-lg font-semibold mb-4">Prochaines actions</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Traiter 3 commandes en attente
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Ajouter 5 nouveaux produits
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                Vérifier stock des best-sellers
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

