"use client";

import type { FuegoEvent } from "@/lib/types";

function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

type EventSelectorProps = {
  events: FuegoEvent[];
  selectedEventId: string | null;
  onSelect: (eventId: string) => void;
};

export default function EventSelector({ events, selectedEventId, onSelect }: EventSelectorProps) {
  if (events.length <= 1) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-fuego-gold">Select Your Night</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select an event">
        {events.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <button
              key={event.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(event.id)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-fuego-goldBright bg-fuego-gold/20 text-fuego-goldBright shadow-gold"
                  : "border-white/15 text-white/70 hover:border-fuego-gold/50 hover:text-white",
              ].join(" ")}
            >
              {event.name}
              <span className="ml-2 text-xs text-white/50">{formatEventDate(event.eventDate)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
