"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import { InvoiceView } from "@/features/checkout/InvoiceView";
import { formatCurrency } from "@/utils/format";
import { checkPhoneExists, createGuestOrder } from "@/services/guest.service";
import countries, { CountryIndicator, DEFAULT_COUNTRY_CODE } from "@/data/countries";
import { getNationalLengthRule } from "@/data/phone-lengths";
import { Order } from "@/types/order";

type Step = "phone" | "details" | "geolocation" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const toast = useToast();

  const { latitude, longitude, loading: geoLoading, error, requestLocation } = useGeolocation();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isPhoneDirty, setIsPhoneDirty] = useState(false);
  const [existingUser, setExistingUser] = useState<{ id: string; name: string; address?: string } | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  const defaultCountry =
    countries.find((country) => country.code === DEFAULT_COUNTRY_CODE) ??
    countries[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryIndicator>(defaultCountry);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement>(null);

  const digitsOnly = phone.replace(/\D/g, "");

  const formatPhoneForBackend = () => {
    const trimmed = digitsOnly.replace(/^0+/, "");
    if (!trimmed) return "";
    const countryDigits = selectedCountry.dial.replace("+", "");
    if (trimmed.startsWith(countryDigits)) {
      return `+${trimmed}`;
    }
    return `${selectedCountry.dial}${trimmed}`;
  };

  const formattedPhone = formatPhoneForBackend();
  const dialDigits = selectedCountry.dial.replace("+", "");
  const nationalNumber = formattedPhone
    ? formattedPhone.startsWith(`+${dialDigits}`)
      ? formattedPhone.slice(1 + dialDigits.length)
      : formattedPhone.replace("+", "")
    : "";
  const expectedLengths = getNationalLengthRule(selectedCountry.code);
  const isNationalLengthValid = expectedLengths
    ? expectedLengths.includes(nationalNumber.length)
    : nationalNumber.length >= 8;
  const isPhoneValid = !!formattedPhone && isNationalLengthValid;
  const showInvalidPhone = isPhoneDirty && digitsOnly.length > 0 && !isPhoneValid;
  const expectedLengthHint = expectedLengths
    ? ` (${expectedLengths.join(" ou ")} chiffres)`
    : "";

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [countryDropdownOpen]);

  const phoneCheckMutation = useMutation({
    mutationFn: () => checkPhoneExists(formattedPhone),
    onSuccess: (data) => {
      if (data.exists && data.user) {
        setExistingUser(data.user);
        setStep("geolocation");
      } else {
        setExistingUser(null);
        setStep("details");
      }
    },
    onError: () => {
      toast.error("Erreur", "Impossible de vérifier le numéro");
    },
  });

  const orderMutation = useMutation({
    mutationFn: () => {
      const customerName = existingUser
        ? existingUser.name
        : `${firstName.trim()} ${lastName.trim()}`.trim();
      
      const customerAddress = existingUser
        ? existingUser.address
        : address.trim();

      return createGuestOrder({
        phone: formattedPhone,
        customerName,
        address: customerAddress || undefined,
        latitude,
        longitude,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      });
    },
    onSuccess: (order) => {
      setLastOrder(order);
      setOrderCreated(true);
      clearCart();
      toast.success("Commande créée", `Votre commande est confirmée`);
    },
    onError: (err: Error) => {
      toast.error("Échec de la commande", err.message);
    },
  });

  const hasLocation = latitude !== null && longitude !== null;
  const isFormValid = existingUser
    ? hasLocation
    : Boolean(firstName.trim() && lastName.trim() && address.trim() && hasLocation);
  const canSubmit = isFormValid && !orderMutation.isPending;
  const isCartEmpty = items.length === 0;

  const handlePhoneSubmit = () => {
    if (!isPhoneValid) return;
    phoneCheckMutation.mutate();
  };

  const handleConfirmOrder = () => {
    if (!canSubmit) return;
    orderMutation.mutate();
  };

  const handleContinueShopping = () => {
    setOrderCreated(false);
    setLastOrder(null);
    router.push("/products");
  };

  if (isCartEmpty && !orderCreated) {
    return (
      <div className="container-safe py-6">
        <div className="card-base p-8 text-center">
          <p className="text-sm text-black/60">Aucun article à commander.</p>
          <button onClick={() => router.push("/products")} className="btn-base mt-4 bg-black px-4 py-3 text-white">
            Aller au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (orderCreated && lastOrder) {
    return (
      <div className="container-safe space-y-6 py-6 pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">Checkout</p>
          <h1 className="section-title">Commande confirmée</h1>
        </div>
        <InvoiceView order={lastOrder} />
        <button onClick={handleContinueShopping} className="btn-base w-full bg-black px-4 py-3 text-white">
         Continuer vos achats
        </button>
      </div>
    );
  }

  return (
    <div className="container-safe space-y-6 py-6 pb-8">
      <button onClick={() => router.back()} className="btn-base border border-black/10 bg-white px-4 py-2 text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </button>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">Checkout</p>
        <h1 className="section-title">Finaliser la commande</h1>
      </div>

      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">Récapitulatif</p>
          <p className="text-sm font-semibold">{formatCurrency(subtotal())}</p>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-black/55">{item.quantity} x {formatCurrency(item.product.price)}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {step === "phone" && (
        <div className="card-base space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Votre numéro de téléphone</h2>
            <p className="text-sm text-black/60">Nous vérifierons si vous êtes déjà client</p>
          </div>

          <div className="flex items-stretch gap-2">
            <div ref={countryPickerRef} className="relative w-28">
              <button
                type="button"
                onClick={() => setCountryDropdownOpen((current) => !current)}
                className="relative z-20 flex w-full items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition hover:border-black/30"
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-xs uppercase tracking-[0.2em]">{selectedCountry.dial}</span>
                <ChevronDown className="h-4 w-4 text-black/60" />
              </button>
              {countryDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full max-h-[18rem] overflow-y-auto rounded-2xl border border-black/10 bg-white py-1 shadow-lg">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setCountryDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-black transition hover:bg-black/5"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-xs uppercase tracking-[0.2em]">{country.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (!isPhoneDirty) {
                    setIsPhoneDirty(true);
                  }
                }}
                placeholder="700 000 000"
                className="input-base w-full"
              />
              {showInvalidPhone && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  Numéro incorrect{expectedLengthHint}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePhoneSubmit}
            disabled={!isPhoneValid || phoneCheckMutation.isPending}
            className="btn-base w-full bg-black px-5 py-4 text-white"
          >
            {phoneCheckMutation.isPending ? <Loader label="Vérification..." /> : "Continuer"}
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="card-base space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Vos informations</h2>
            <p className="text-sm text-black/60">Nouveau client - créez votre profil</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-xs text-black/70">
              <span>Prénom</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base w-full"
                placeholder="Prénom"
              />
            </label>
            <label className="space-y-2 text-xs text-black/70">
              <span>Nom</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base w-full"
                placeholder="Nom"
              />
            </label>
          </div>

          <label className="space-y-2 text-xs text-black/70">
            <span>Adresse de livraison</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-base h-24 w-full resize-none"
              placeholder="Ex : Bloc D, Cocody Angré 8e tranche"
            />
          </label>

          <button
            type="button"
            onClick={() => setStep("geolocation")}
            disabled={!firstName.trim() || !lastName.trim() || !address.trim()}
            className="btn-base w-full bg-black px-5 py-4 text-white disabled:opacity-50"
          >
            Continuer
          </button>
        </div>
      )}

      {step === "geolocation" && (
        <div className="card-base space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Localisation</h2>
            <p className="text-sm text-black/60">Autorisez la géolocalisation pour la livraison</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Position GPS</p>
              <p className="text-sm text-black/55">
                Utilisée uniquement pour la livraison
              </p>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoLoading || hasLocation}
              className="btn-base border border-black/10 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/40"
            >
              {geoLoading ? <Loader label="..." /> : hasLocation ? "Position récupérée" : "Activer"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {hasLocation && (
            <p className="text-xs text-black/60">
              Latitude: {latitude?.toFixed(5)}, Longitude: {longitude?.toFixed(5)}
            </p>
          )}

          <button
            type="button"
            onClick={() => setStep("review")}
            disabled={!hasLocation}
            className="btn-base w-full bg-black px-5 py-4 text-white disabled:opacity-50"
          >
            Confirmer la commande
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="card-base space-y-3 p-4">
            <p className="text-sm font-medium">Récapitulatif</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Téléphone</span>
                <span>{formattedPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Nom</span>
                <span>{existingUser?.name || `${firstName} ${lastName}`}</span>
              </div>
              {(existingUser?.address || address) && (
                <div className="flex justify-between">
                  <span className="text-black/60">Adresse</span>
                  <span className="text-right">{existingUser?.address || address}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={!canSubmit}
            className="btn-base w-full bg-black px-5 py-4 text-white disabled:opacity-50"
          >
            {orderMutation.isPending ? "Création..." : "Confirmer la commande"}
          </button>
        </div>
      )}
    </div>
  );
}