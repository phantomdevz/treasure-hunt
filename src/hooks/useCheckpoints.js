"use client";
import { useState, useEffect } from "react";
import { subscribeCheckpoints } from "@/lib/firebase";

export function useCheckpoints() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeCheckpoints((data) => {
      setCheckpoints(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { checkpoints, loading, error };
}
