"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { clientDb } from "@/lib/firebaseClient";
import type { PublicEventBooth } from "@/lib/types";

// Firestore's realtime listener keeps this in sync automatically (a sale
// on another device flips status without a manual refresh); the focus-based
// refetch below is a cheap safety net in case a listener misses a reconnect.
export function useEventBooths(eventId: string | null) {
  const [booths, setBooths] = useState<Record<string, PublicEventBooth>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setBooths({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(clientDb, "eventBooths"), where("eventId", "==", eventId));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const next: Record<string, PublicEventBooth> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as PublicEventBooth;
          next[data.boothId] = data;
        });
        setBooths(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to load booth availability", err);
        setError("We couldn't load current availability. Please refresh and try again.");
        setLoading(false);
      }
    );

    const refetch = async () => {
      try {
        const snap = await getDocs(q);
        const next: Record<string, PublicEventBooth> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as PublicEventBooth;
          next[data.boothId] = data;
        });
        setBooths(next);
      } catch (err) {
        console.error("Focus refetch failed", err);
      }
    };

    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refetch();
    });

    return () => {
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [eventId]);

  return { booths, loading, error };
}
