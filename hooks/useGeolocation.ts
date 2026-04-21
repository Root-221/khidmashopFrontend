"use client";

import { useCallback, useState } from "react";

export function useGeolocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée sur cet appareil.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Accès à la localisation refusé."
            : "Impossible de récupérer la localisation.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, []);

  return { latitude, longitude, loading, error, requestLocation };
}
