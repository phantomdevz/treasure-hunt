"use client";
import { useState, useEffect, useCallback } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isManualOffline, setIsManualOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleManualOffline = useCallback(() => {
    setIsManualOffline((v) => !v);
  }, []);

  const effectivelyOnline = isOnline && !isManualOffline;

  return {
    isOnline: effectivelyOnline,
    isActuallyOnline: isOnline,
    isManualOffline,
    toggleManualOffline,
  };
}
