"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users2, Phone, Shield } from "lucide-react";
import { listUsers } from "@/services/user.service";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { formatDate } from "@/utils/format";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({ 
    queryKey: ["admin-users"], 
    queryFn: () => listUsers() 
  });

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      clients: users.filter((u) => u.role === "CLIENT").length,
    };
  }, [users]);

  const roleColors = {
    ADMIN: "bg-black text-white border border-black/20",
    CLIENT: "bg-white text-black border border-black/20",
  };

  const renderUserCard = (user: any) => (
    <div key={user.id} className="p-4 rounded-lg border border-black/20 bg-white hover:bg-black/5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-black">{user.name}</p>
          <p className="text-xs text-black/60">{user.phone}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors]}`}>
          {user.role === "ADMIN" ? (
            <Shield className="h-3 w-3" />
          ) : null}
          {user.role === "ADMIN" ? "Administrateur" : "Client"}
        </span>
      </div>
      <div className="text-xs text-black/60">
        Inscrit le {formatDate(user.createdAt)}
      </div>
    </div>
  );

  const renderUserTable = (users: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black/10">
            <th className="text-left py-3 px-4 font-semibold text-sm text-black">Utilisateur</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-black hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-black hidden lg:table-cell">Téléphone</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-black">Rôle</th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-black hidden sm:table-cell">Date d&apos;inscription</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-black/2.5 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-black">{user.name}</p>
                  <p className="text-xs text-black/50 md:hidden">{user.phone}</p>
                </div>
              </td>
              <td className="py-4 px-4 hidden md:table-cell">
                <div className="flex items-center gap-2 text-sm text-black">
                  <Phone className="h-4 w-4 text-black/40" />
                  <span>{user.phone}</span>
                </div>
              </td>
              <td className="py-4 px-4 hidden lg:table-cell">
                <div className="flex items-center gap-2 text-sm text-black">
                  <Phone className="h-4 w-4 text-black/40" />
                  {user.phone || "—"}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors]}`}>
                          {user.role === "ADMIN" ? (
                            <Shield className="h-3 w-3" />
                          ) : null}
                          {user.role === "ADMIN" ? "Administrateur" : "Client"}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-black/60 hidden sm:table-cell">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <AdminHeader
        icon={<Users2 className="h-5 w-5" />}
        title="Utilisateurs"
        description="Gérez les clients et administrateurs"
        breadcrumbs={[{ label: "Accueil" }, { label: "Utilisateurs" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard hover={false}>
          <div>
            <p className="text-sm text-black/60 font-medium">Total</p>
            <p className="text-3xl font-bold mt-2 text-black">{stats.total}</p>
            <p className="text-xs text-black/40 mt-2">Utilisateurs enregistrés</p>
          </div>
        </AdminCard>
        <AdminCard hover={false}>
          <div>
            <p className="text-sm text-black/60 font-medium">Administrateurs</p>
            <p className="text-3xl font-bold mt-2 text-black">{stats.admins}</p>
            <p className="text-xs text-black/40 mt-2">Comptes administrateur</p>
          </div>
        </AdminCard>
        <AdminCard hover={false}>
          <div>
            <p className="text-sm text-black/60 font-medium">Clients</p>
            <p className="text-3xl font-bold mt-2 text-black">{stats.clients}</p>
            <p className="text-xs text-black/40 mt-2">Clients actifs</p>
          </div>
        </AdminCard>
      </div>

      {/* Users List */}
      <AdminCard>
        <h3 className="text-lg font-bold text-black mb-6">Liste des utilisateurs</h3>
        <AdminDataDisplay
          data={users}
          isLoading={isLoading}
          itemsPerPage={8}
          defaultView="list"
          emptyMessage="Aucun utilisateur trouvé"
          renderGrid={(users) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => renderUserCard(user))}
            </div>
          )}
          renderList={(users) => renderUserTable(users)}
        />
      </AdminCard>
    </div>
  );
}
