"use client";

import { useState } from "react";
import type { BoothDefinition } from "@/data/fuegoFloorPlan";
import type { DisplayStatus } from "@/components/fuego/BoothHotspot";
import type { FuegoEvent, PublicEventBooth } from "@/lib/types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

type BoothReservationFormProps = {
  booth: BoothDefinition;
  event: FuegoEvent;
  eventBooth: PublicEventBooth;
  status: DisplayStatus;
  onClose: () => void;
  onConflict: () => void;
};

export default function BoothReservationForm({
  booth,
  event,
  eventBooth,
  status,
  onClose,
  onConflict,
}: BoothReservationFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const capacity = eventBooth.capacity;

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!guestName.trim()) nextErrors.guestName = "Please enter the name for this reservation.";
    const digits = phoneNumber.replace(/\D/g, "");
    if (!phoneNumber.trim()) nextErrors.phoneNumber = "Please enter a phone number.";
    else if (digits.length < 10) nextErrors.phoneNumber = "Please enter a valid phone number.";
    if (!Number.isInteger(guestCount) || guestCount < 1) nextErrors.guestCount = "Guest count must be at least 1.";
    else if (guestCount > capacity) nextErrors.guestCount = `${booth.name} accommodates up to ${capacity} guests.`;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, boothId: booth.id, guestName, guestCount, phoneNumber }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setSubmitError(data.error ?? "This section was just reserved by another guest. Please select another available section.");
        onConflict();
        setSubmitting(false);
        return;
      }

      if (!res.ok || !data.url) {
        setSubmitError(data.error ?? "We couldn't start secure checkout. Your card has not been charged. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout request failed", err);
      setSubmitError("We couldn't start secure checkout. Your card has not been charged. Please try again.");
      setSubmitting(false);
    }
  }

  const isSold = status === "sold";
  const isHeld = status === "held";
  const isUnavailable = isSold || isHeld;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-fuego-gold">
            {booth.category === "vip" ? "VIP Booth" : "Main Floor Booth"}
          </p>
          <h2 className="font-display text-2xl font-bold text-white">{booth.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reservation panel"
          className="rounded-full border border-white/15 p-2 text-white/70 hover:border-fuego-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuego-goldBright"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-white/50">Event</dt>
          <dd className="text-white">{event.name}</dd>
        </div>
        <div>
          <dt className="text-white/50">Date</dt>
          <dd className="text-white">{formatEventDate(event.eventDate)}</dd>
        </div>
        <div>
          <dt className="text-white/50">Price</dt>
          <dd className="text-fuego-goldBright font-semibold">{formatPrice(eventBooth.price)}</dd>
        </div>
        <div>
          <dt className="text-white/50">Capacity</dt>
          <dd className="text-white">Up to {capacity} guests</dd>
        </div>
        {eventBooth.minimumSpend ? (
          <div className="col-span-2">
            <dt className="text-white/50">Minimum Spend</dt>
            <dd className="text-white">{formatPrice(eventBooth.minimumSpend)}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-white/70">{booth.description}</p>

      {isSold && (
        <div className="mt-6 rounded-lg border border-fuego-red/40 bg-fuego-red/10 px-4 py-3 text-sm text-white">
          This section has already been reserved for {event.name}. Please select another available section.
        </div>
      )}

      {isHeld && (
        <div className="mt-6 rounded-lg border border-fuego-red/40 bg-fuego-red/10 px-4 py-3 text-sm text-white">
          Reservation in progress — another guest is currently completing checkout for this section. Please check
          back shortly or select another available section.
        </div>
      )}

      {!isUnavailable && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="guestName" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Full Name
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-fuego-gold focus:ring-1 focus:ring-fuego-gold"
              placeholder="John Smith"
            />
            {errors.guestName && <p className="mt-1 text-xs text-fuego-redBright">{errors.guestName}</p>}
          </div>

          <div>
            <label htmlFor="guestCount" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Number of Guests
            </label>
            <input
              id="guestCount"
              type="number"
              min={1}
              max={capacity}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-fuego-gold focus:ring-1 focus:ring-fuego-gold"
            />
            {errors.guestCount && <p className="mt-1 text-xs text-fuego-redBright">{errors.guestCount}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-fuego-gold focus:ring-1 focus:ring-fuego-gold"
              placeholder="(813) 555-1234"
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-fuego-redBright">{errors.phoneNumber}</p>}
          </div>

          {submitError && (
            <div className="rounded-lg border border-fuego-red/40 bg-fuego-red/10 px-4 py-3 text-sm text-white">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gradient-to-b from-fuego-goldBright to-fuego-gold px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? "Securing Your Section..." : "Continue to Secure Checkout"}
          </button>
        </form>
      )}
    </div>
  );
}
