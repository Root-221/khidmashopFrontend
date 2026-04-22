"use client";

import { useState, useRef, useEffect } from "react";
import { X, Lock, Phone, Eye, EyeOff, ChevronDown } from "lucide-react";
import { clientLogin } from "@/services/auth.service";
import { useUiStore } from "@/stores/useUiStore";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import countries, { CountryIndicator, DEFAULT_COUNTRY_CODE } from "@/data/countries";

export function LoginModal() {
  const { loginModalOpen, closeLoginModal } = useUiStore();
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultCountry = countries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? countries[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryIndicator>(defaultCountry);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [countryDropdownOpen]);

  if (!loginModalOpen) return null;

  const getFormattedPhone = () => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    const dial = selectedCountry.dial.replace("+", "");
    if (digits.startsWith(dial)) return `+${digits}`;
    return `${selectedCountry.dial}${digits.replace(/^0+/, "")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error("Erreur", "Le code PIN doit comporter 4 chiffres");
      return;
    }

    setIsLoading(true);
    try {
      await clientLogin({ 
        phone: getFormattedPhone(), 
        pin 
      });
      toast.success("Succès", "Connexion réussie");
      closeLoginModal();
    } catch (error: any) {
      let message = error.details || error.message || "Identifiants incorrects";
      // Nettoyage des résidus techniques comme "not found"
      message = message.replace(/\.?\s*not\s*found$/i, ".");
      toast.error("Erreur de connexion", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLoginModal}
      />
      
      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300 rounded-3xl bg-white p-8 shadow-2xl">
        <button 
          onClick={closeLoginModal}
          className="absolute right-6 top-6 rounded-full p-2 transition hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-black">Connexion</h2>
          <p className="mt-2 text-sm text-black/50">Veuillez entrer vos identifiants pour accéder à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Téléphone</label>
            <div className="flex gap-2">
              <div ref={countryPickerRef} className="relative w-28">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="flex h-12 w-full items-center justify-between gap-1 rounded-2xl border border-black/10 bg-white px-3 text-sm font-medium shadow-sm transition hover:border-black/30"
                >
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-xs">{selectedCountry.dial}</span>
                  <ChevronDown className="h-3 w-3 text-black/40" />
                </button>
                {countryDropdownOpen && (
                  <div className="absolute left-0 top-full z-[110] mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-black/10 bg-white py-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {countries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryDropdownOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-black/5"
                      >
                        <span>{c.flag}</span>
                        <span className="text-xs text-black/40">{c.dial}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77 000 00 00"
                  className="input-base h-12 w-full pl-11"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black/40 px-1">Code PIN (4 chiffres)</label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="****"
                className="input-base h-12 w-full text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-normal"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-black/30 transition hover:bg-black/5 hover:text-black"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className="btn-base w-full bg-black py-4 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? <Loader label="Connexion..." white /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
