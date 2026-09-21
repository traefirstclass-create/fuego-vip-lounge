"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type StatusResponse =
  | { status: "pending" }
  | { status: "expired" }
  | { status: "not_found" }
  | {
      status: "paid";
      confirmationNumber: string;
      boothName: string;
      eventName: string;
      eventDate: string;
      guestCount: number;
      amount: number;
    };

function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReservationSuccessPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-fuego-gold/30 border-t-fuego-goldBright" />
        </Centered>
      }
    >
      <ReservationSuccessContent />
    </Suspense>
  );
}

function ReservationSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<StatusResponse | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const res = await fetch(`/api/reservation-status?session_id=${encodeURIComponent(sessionId!)}`);
        const data: StatusResponse = await res.json();
        if (cancelled) return;
        setResult(data);
        if (data.status !== "pending") clearInterval(interval);
      } catch (err) {
        console.error("Failed to check reservation status", err);
      }
    }

    poll();
    interval = setInterval(poll, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <Centered>
        <p className="text-white/70">No checkout session was found.</p>
        <ReturnLink />
      </Centered>
    );
  }

  if (!result || result.status === "pending") {
    return (
      <Centered>
        <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-fuego-gold/30 border-t-fuego-goldBright" />
        <h1 className="font-display text-2xl font-bold text-white">Confirming your reservation...</h1>
        <p className="mt-2 text-sm text-white/60">This only takes a moment while we verify your payment with Stripe.</p>
      </Centered>
    );
  }

  if (result.status === "not_found") {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-bold text-white">We couldn&apos;t find that reservation</h1>
        <p className="mt-2 text-sm text-white/60">If you completed payment, please contact Fuego VIP Lounge directly.</p>
        <ReturnLink />
      </Centered>
    );
  }

  if (result.status === "expired") {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-bold text-white">This checkout session expired</h1>
        <p className="mt-2 text-sm text-white/60">Your section was not charged and has been released. Please select another section.</p>
        <ReturnLink />
      </Centered>
    );
  }

  return (
    <Centered>
      <p className="text-xs font-semibold uppercase tracking-widest text-fuego-gold">Confirmed</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Your VIP Experience Is Reserved</h1>
      <div className="mt-8 w-full max-w-sm rounded-xl border border-fuego-gold/25 bg-fuego-charcoal/70 p-6 text-left">
        <Row label="Confirmation #" value={result.confirmationNumber} accent />
        <Row label="Section" value={result.boothName} />
        <Row label="Event" value={result.eventName} />
        <Row label="Date" value={formatEventDate(result.eventDate)} />
        <Row label="Guests" value={String(result.guestCount)} />
        <Row label="Amount Paid" value={`$${(result.amount / 100).toLocaleString()}`} />
      </div>
      <p className="mt-6 max-w-sm text-xs text-white/50">
        Please save your confirmation number. Show it at the door on the night of your reservation.
      </p>
      <ReturnLink />
    </Centered>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 text-sm last:border-0">
      <span className="text-white/50">{label}</span>
      <span className={accent ? "font-semibold text-fuego-goldBright" : "text-white"}>{value}</span>
    </div>
  );
}

function ReturnLink() {
  return (
    <Link
      href="/reserve"
      className="mt-6 inline-block rounded-md border border-fuego-gold/40 px-5 py-2.5 text-sm font-semibold text-fuego-goldBright transition-colors hover:bg-fuego-gold/10"
    >
      Return to Floor Plan
    </Link>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">{children}</div>
  );
}
