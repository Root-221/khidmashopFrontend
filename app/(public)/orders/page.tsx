"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { searchOrdersByPhone } from "@/services/order.service";
import { Order } from "@/types/order";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency, formatDate, orderLabel, orderStatusLabel } from "@/utils/format";
import { statusTone } from "@/utils/identity";
import countries, { CountryIndicator, DEFAULT_COUNTRY_CODE } from "@/data/countries";
import { getNationalLengthRule } from "@/data/phone-lengths";

export default function OrdersPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isPhoneDirty, setIsPhoneDirty] = useState(false);
  const [searched, setSearched] = useState(false);

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

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", formattedPhone],
    queryFn: () => searchOrdersByPhone(formattedPhone),
    enabled: searched && isPhoneValid,
  });

  const handleSearch = () => {
    if (!isPhoneValid) return;
    setSearched(true);
  };

  return (
    <div className="container-safe space-y-6 py-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-black/40">Commandes</p>
        <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
      </div>

      <div className="card-base space-y-4 p-5">
        <p className="text-sm text-black/60">Entrez votre numéro de téléphone pour voir vos commandes</p>

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
                Numéro incorrect
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!isPhoneValid}
          className="btn-base w-full bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          Rechercher
        </button>
      </div>

      {searched && isLoading && (
        <Loader className="py-10" />
      )}

      {searched && !isLoading && orders.length === 0 && (
        <div className="card-base p-8 text-center">
          <p className="text-sm text-black/60">Aucune commande trouvée pour ce numéro</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group block rounded-2xl border border-black/8 p-6 hover:border-black/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusTone(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{orderLabel(order)}</p>
                  <p className="text-sm text-black/60 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-xl font-bold text-right">{formatCurrency(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}