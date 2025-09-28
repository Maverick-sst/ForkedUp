// src/hooks/useGeoLocation.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "userLocation";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("idle"); 
  // idle | loading | ready | denied | unsupported | error

  // read from localStorage
  const readStored = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.timestamp > TTL) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return obj;
    } catch {
      return null;
    }
  }, []);

  // save to localStorage
  const save = useCallback((loc) => {
    const payload = { ...loc, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLocation(payload);
    setStatus("ready");
  }, []);

  // request geolocation
  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        save({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === 1) setStatus("denied");
        else setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [save]);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
    setStatus("idle");
  }, []);

  // load from storage on mount
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setLocation(stored);
      setStatus("ready");
    }
  }, [readStored]);

  return { location, status, requestLocation, clearLocation };
}
