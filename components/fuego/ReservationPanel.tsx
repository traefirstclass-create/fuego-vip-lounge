"use client";

import { useEffect, useRef } from "react";
import type { BoothDefinition } from "@/data/fuegoFloorPlan";
import type { DisplayStatus } from "@/components/fuego/BoothHotspot";
import type { FuegoEvent, PublicEventBooth } from "@/lib/types";
import BoothReservationForm from "@/components/fuego/BoothReservationForm";

type ReservationPanelProps = {
  booth: BoothDefinition | null;
  event: FuegoEvent | null;
  eventBooth: PublicEventBooth | null;
  status: DisplayStatus | null;
  onClose: () => void;
  onConflict: () => void;
};

export default function ReservationPanel({ booth, event, eventBooth, status, onClose, onConflict }: ReservationPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!booth || !event || !eventBooth || !status) {
    return (
      <div className="hidden h-full flex-col items-center justify-center rounded-xl border border-white/10 bg-fuego-charcoal/60 p-8 text-center lg:flex">
        <p className="text-sm text-white/50">
          Click any available section on the floor plan to view pricing, capacity, and reserve it.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={`${booth.name} reservation details`}
      className="hidden h-fit rounded-xl border border-fuego-gold/25 bg-fuego-charcoal/80 p-6 shadow-2xl backdrop-blur lg:block"
    >
      <BoothReservationForm booth={booth} event={event} eventBooth={eventBooth} status={status} onClose={onClose} onConflict={onConflict} />
    </div>
  );
}
