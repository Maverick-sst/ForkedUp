// hooks/useGeoLocation.js
import { useState, useCallback } from "react";

export function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); 
  // idle | loading | ready | denied | error | unsupported

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        console.log(coords)
        setStatus("ready");
      },
      (err) => {
        if (err.code === 1) setStatus("denied");
        else setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, status, requestLocation };
}
