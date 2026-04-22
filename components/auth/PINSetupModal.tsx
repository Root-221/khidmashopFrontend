"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { setPin } from "@/services/auth.service";
import { useUiStore } from "@/stores/useUiStore";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";

export function PINSetupModal() {
  const { pinSetupModalOpen, pinSetupPhone, closePinSetupModal } = useUiStore();
  const router = useRouter();
  const toast = useToast();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!pinSetupModalOpen || !pinSetupPhone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error("Erreur", "Le code PIN doit comporter 4 chiffres");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("Erreur", "Les codes PIN ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      await setPin({ phone: pinSetupPhone, pin });
      toast.success("Compte sécurisé", "Votre compte est prêt ! Vous êtes maintenant connecté.");
      closePinSetupModal();
      router.push("/orders");
    } catch (error: any) {
      const message = error.details || error.message || "Impossible de configurer le PIN";
      toast.error("Erreur", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300 rounded-3xl bg-white p-8 shadow-2xl">
        <button 
          onClick={closePinSetupModal}
          className="absolute right-6 top-6 rounded-full p-2 transition hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-black">Sécurisez votre compte</h2>
          <p className="mt-2 text-sm text-black/50">
            Choisissez un code PIN à 4 chiffres pour accéder à votre historique de commandes lors de vos prochaines visites.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Choisir un PIN (4 chiffres)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                placeholder="****"
                className="input-base w-full text-center text-2xl tracking-[0.5em] placeholder:tracking-normal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Confirmer le PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="****"
                className="input-base w-full text-center text-2xl tracking-[0.5em] placeholder:tracking-normal"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length !== 4 || pin !== confirmPin}
            className="btn-base w-full bg-black py-4 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? <Loader label="Configuration..." white /> : "Activer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
