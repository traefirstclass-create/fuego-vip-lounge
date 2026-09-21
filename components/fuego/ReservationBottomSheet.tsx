"use client";

import { useEffect, useRef } from "react";
import type { BoothDefinition } from "@/data/fuegoFloorPlan";
import type { DisplayStatus } from "@/components/fuego/BoothHotspot";
import type { FuegoEvent, PublicEventBooth } from "@/lib/types";
import BoothReservationForm from "@/components/fuego/BoothReservationForm";

type ReservationBottomSheetProps = {
  booth: BoothDefinition | null;
  event: FuegoEvent | null;
  eventBooth: PublicEventBooth | null;
  status: DisplayStatus | null;
  onClose: () => void;
  onConflict: () => void;
};

export default function ReservationBottomSheet({
  booth,
  event,
  eventBooth,
  status,
  onClose,
  onConflict,
}: ReservationBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const open = Boolean(booth && event && eventBooth && status);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !booth || !event || !eventBooth || !status) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${booth.name} reservation details`}
        tabIndex={-1}
        className="fuego-sheet-enter absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-fuego-gold/25 bg-fuego-charcoal p-6 pb-8 shadow-2xl outline-none"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <BoothReservationForm booth={booth} event={event} eventBooth={eventBooth} status={status} onClose={onClose} onConflict={onConflict} />
      </div>
    </div>
  );
}
