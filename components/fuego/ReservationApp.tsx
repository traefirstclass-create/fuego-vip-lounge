"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/hooks/useEvents";
import { useEventBooths } from "@/lib/hooks/useEventBooths";
import { FUEGO_BOOTH_MAP } from "@/data/fuegoFloorPlan";
import type { DisplayStatus } from "@/components/fuego/BoothHotspot";
import FuegoFloorPlan from "@/components/fuego/FuegoFloorPlan";
import EventSelector from "@/components/fuego/EventSelector";
import AvailabilityLegend from "@/components/fuego/AvailabilityLegend";
import ReservationPanel from "@/components/fuego/ReservationPanel";
import ReservationBottomSheet from "@/components/fuego/ReservationBottomSheet";

type ReservationAppProps = {
  initialEventSlug?: string;
  initialBoothId?: string;
};

export default function ReservationApp({ initialEventSlug, initialBoothId }: ReservationAppProps) {
  const router = useRouter();
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialEventSlug ?? null);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(initialBoothId ?? null);

  useEffect(() => {
    if (selectedEventId || events.length === 0) return;
    setSelectedEventId(events[0]!.id);
  }, [events, selectedEventId]);

  const { booths, loading: boothsLoading, error: boothsError } = useEventBooths(selectedEventId);

  const selectedEvent = useMemo(() => events.find((e) => e.id === selectedEventId) ?? null, [events, selectedEventId]);
  const selectedBoothDef = selectedBoothId ? FUEGO_BOOTH_MAP[selectedBoothId] ?? null : null;
  const selectedEventBooth = selectedBoothId ? booths[selectedBoothId] ?? null : null;

  function statusFor(boothId: string): DisplayStatus {
    if (eventsLoading || boothsLoading) return "loading";
    const eb = booths[boothId];
    if (!eb || !eb.active) return "disabled";
    if (eb.status === "held" && (!eb.heldUntil || eb.heldUntil < Date.now())) return "available";
    return eb.status;
  }

  const selectedStatus = selectedBoothId ? statusFor(selectedBoothId) : null;

  function updateUrl(eventId: string | null, boothId: string | null) {
    const params = new URLSearchParams();
    if (eventId) params.set("event", eventId);
    if (boothId) params.set("section", boothId);
    router.replace(`/reserve${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
    setSelectedBoothId(null);
    updateUrl(eventId, null);
  }

  function handleSelectBooth(boothId: string) {
    setSelectedBoothId(boothId);
    updateUrl(selectedEventId, boothId);
  }

  function handleClose() {
    setSelectedBoothId(null);
    updateUrl(selectedEventId, null);
  }

  const hasError = eventsError || boothsError;

  return (
    <section aria-labelledby="fuego-reserve-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuego-gold">Fuego VIP Lounge</p>
        <h1 id="fuego-reserve-heading" className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          Reserve Your VIP Experience
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
          Select your night and choose an available section directly from the floor plan.
        </p>
      </div>

      <EventSelector events={events} selectedEventId={selectedEventId} onSelect={handleSelectEvent} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <AvailabilityLegend />
      </div>

      {hasError && (
        <div className="mb-4 rounded-lg border border-fuego-red/40 bg-fuego-red/10 px-4 py-3 text-sm text-white">
          {eventsError ?? boothsError}
        </div>
      )}

      {!eventsLoading && events.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-fuego-charcoal/60 p-10 text-center text-white/60">
          No upcoming nights are open for reservations right now. Check back soon.
        </div>
      )}

      {(eventsLoading || events.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <FuegoFloorPlan statusFor={statusFor} selectedBoothId={selectedBoothId} onSelect={handleSelectBooth} />
          <ReservationPanel
            booth={selectedBoothDef}
            event={selectedEvent}
            eventBooth={selectedEventBooth}
            status={selectedStatus}
            onClose={handleClose}
            onConflict={() => {}}
          />
        </div>
      )}

      <ReservationBottomSheet
        booth={selectedBoothDef}
        event={selectedEvent}
        eventBooth={selectedEventBooth}
        status={selectedStatus}
        onClose={handleClose}
        onConflict={() => {}}
      />
    </section>
  );
}
