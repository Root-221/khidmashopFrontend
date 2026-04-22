"use client";

import { LogOut, X } from "lucide-react";
import { logout } from "@/services/auth.service";
import { useUiStore } from "@/stores/useUiStore";
import { useToast } from "@/hooks/useToast";

export function LogoutConfirmModal() {
  const { logoutConfirmModalOpen, closeLogoutConfirmModal } = useUiStore();
  const toast = useToast();

  if (!logoutConfirmModalOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnecté", "À bientôt !");
      closeLogoutConfirmModal();
    } catch (error) {
      toast.error("Erreur", "Problème lors de la déconnexion");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLogoutConfirmModal}
      />
      
      <div className="relative w-full max-w-sm animate-in fade-in zoom-in duration-300 rounded-3xl bg-white p-8 shadow-2xl">
        <button 
          onClick={closeLogoutConfirmModal}
          className="absolute right-6 top-6 rounded-full p-2 transition hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <LogOut className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-black">Déconnexion</h2>
          <p className="mt-2 text-sm text-black/50">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeLogoutConfirmModal}
            className="btn-base flex-1 border border-black/10 bg-white py-3 text-sm font-bold text-black hover:bg-black/5"
          >
            Annuler
          </button>
          <button
            onClick={handleLogout}
            className="btn-base flex-1 bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Oui, déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
