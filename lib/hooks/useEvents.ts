"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { clientDb } from "@/lib/firebaseClient";
import type { FuegoEvent } from "@/lib/types";

export function useEvents() {
  const [events, setEvents] = useState<FuegoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(clientDb, "events"), where("active", "==", true), orderBy("eventDate", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => d.data() as FuegoEvent));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to load events", err);
        setError("We couldn't load upcoming nights. Please refresh and try again.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { events, loading, error };
}
