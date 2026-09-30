"use client";
import { useEffect } from "react";
import { getUnsyncedEvents, markSynced } from "@/lib/db";
import { pushCompletionEvents } from "@/lib/firebase";
import { useNetworkStatus } from "./useNetworkStatus";

export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) return;
    (async () => {
      try {
        const events = await getUnsyncedEvents();
        if (events.length === 0) return;
        await pushCompletionEvents(events);
        await markSynced(events.map((e) => e.id));
        console.log(`[Route:404] Synced ${events.length} events to Firestore`);
      } catch (err) {
        console.warn("[Route:404] Sync failed:", err);
      }
    })();
  }, [isOnline]);
}
