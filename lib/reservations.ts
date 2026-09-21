import { randomBytes } from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getBoothDefinition } from "@/data/fuegoFloorPlan";
import type { EventBooth, FuegoEvent, Reservation } from "@/lib/types";

export const HOLD_DURATION_MS = 30 * 60 * 1000; // 30 minutes — matches Stripe Checkout's minimum expires_at window

export function eventBoothDocId(eventId: string, boothId: string): string {
  return `${eventId}_${boothId}`;
}

export function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i]! % chars.length];
  }
  return `FUEGO-${code}`;
}

export class ReservationError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export type CreateHoldInput = {
  eventId: string;
  boothId: string;
  guestName: string;
  guestCount: number;
  phoneNumber: string;
};

export type CreateHoldResult = {
  reservationId: string;
  confirmationNumber: string;
  amount: number;
  eventName: string;
  eventDate: string;
  boothName: string;
  heldUntil: number;
};

// Atomically holds an event+booth for a reservation. Equivalent to:
//   UPDATE event_booths SET status='held', held_until=?
//   WHERE event_id=? AND booth_id=? AND status='available'
// via a Firestore transaction (read-verify-write, retried by the SDK on
// contention) instead of a SQL conditional update.
export async function createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
  const boothDef = getBoothDefinition(input.boothId);
  if (!boothDef) {
    throw new ReservationError("invalid_booth", "This section does not exist.", 404);
  }

  const guestName = input.guestName.trim();
  if (!guestName) {
    throw new ReservationError("invalid_name", "Please enter the name for this reservation.");
  }

  const phoneDigits = input.phoneNumber.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    throw new ReservationError("invalid_phone", "Please enter a valid phone number.");
  }

  if (!Number.isInteger(input.guestCount) || input.guestCount < 1) {
    throw new ReservationError("invalid_guest_count", "Guest count must be at least 1.");
  }

  const db = getAdminDb();
  const eventRef = db.collection("events").doc(input.eventId);
  const eventBoothRef = db.collection("eventBooths").doc(eventBoothDocId(input.eventId, input.boothId));
  const reservationRef = db.collection("reservations").doc();

  const now = Date.now();

  const result = await db.runTransaction(async (tx) => {
    const [eventSnap, eventBoothSnap] = await Promise.all([tx.get(eventRef), tx.get(eventBoothRef)]);

    if (!eventSnap.exists) {
      throw new ReservationError("invalid_event", "This event could not be found.", 404);
    }
    const event = eventSnap.data() as FuegoEvent;
    if (!event.active) {
      throw new ReservationError("event_inactive", "This event is no longer accepting reservations.", 409);
    }

    if (!eventBoothSnap.exists) {
      throw new ReservationError("invalid_booth", "This section is not available for this event.", 404);
    }
    const eventBooth = eventBoothSnap.data() as EventBooth;

    if (!eventBooth.active) {
      throw new ReservationError("booth_disabled", "This section is not currently bookable.", 409);
    }

    if (input.guestCount > eventBooth.capacity) {
      throw new ReservationError(
        "capacity_exceeded",
        `${boothDef.name} accommodates up to ${eventBooth.capacity} guests.`,
        400
      );
    }

    const isRecoverableStaleHold =
      eventBooth.status === "held" && (eventBooth.heldUntil === null || eventBooth.heldUntil < now);

    if (eventBooth.status === "sold") {
      throw new ReservationError(
        "booth_unavailable",
        "This section was just reserved by another guest. Please select another available section.",
        409
      );
    }

    if (eventBooth.status !== "available" && !isRecoverableStaleHold) {
      throw new ReservationError(
        "booth_unavailable",
        "This section was just reserved by another guest. Please select another available section.",
        409
      );
    }

    const heldUntil = now + HOLD_DURATION_MS;
    const confirmationNumber = generateConfirmationNumber();

    const reservation: Reservation = {
      id: reservationRef.id,
      confirmationNumber,
      eventId: input.eventId,
      boothId: input.boothId,
      guestName,
      guestCount: input.guestCount,
      phoneNumber: phoneDigits,
      status: "held",
      paymentStatus: "pending",
      amount: eventBooth.price,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      heldAt: now,
      heldUntil,
      paidAt: null,
      cancelledAt: null,
      createdAt: now,
      updatedAt: now,
    };

    tx.set(reservationRef, reservation);
    tx.update(eventBoothRef, {
      status: "held",
      heldUntil,
      reservationId: reservationRef.id,
      updatedAt: now,
    });

    return {
      reservationId: reservationRef.id,
      confirmationNumber,
      amount: eventBooth.price,
      eventName: event.name,
      eventDate: event.eventDate,
      boothName: boothDef.name,
      heldUntil,
    };
  });

  return result;
}

export async function attachCheckoutSession(
  reservationId: string,
  stripeCheckoutSessionId: string
): Promise<void> {
  const db = getAdminDb();
  await db.collection("reservations").doc(reservationId).update({
    stripeCheckoutSessionId,
    updatedAt: Date.now(),
  });
}

// Releases a hold back to the underlying reservation's booth — used when
// Stripe Checkout Session creation fails after the hold was already placed.
export async function releaseHoldForReservation(reservationId: string): Promise<void> {
  const db = getAdminDb();
  const reservationRef = db.collection("reservations").doc(reservationId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reservationRef);
    if (!snap.exists) return;
    const reservation = snap.data() as Reservation;
    if (reservation.status === "paid") return; // never release a paid booth

    const eventBoothRef = db
      .collection("eventBooths")
      .doc(eventBoothDocId(reservation.eventId, reservation.boothId));
    const eventBoothSnap = await tx.get(eventBoothRef);

    const now = Date.now();
    tx.update(reservationRef, { status: "cancelled", cancelledAt: now, updatedAt: now });

    if (eventBoothSnap.exists) {
      const eventBooth = eventBoothSnap.data() as EventBooth;
      if (eventBooth.status === "held" && eventBooth.reservationId === reservationId) {
        tx.update(eventBoothRef, {
          status: "available",
          heldUntil: null,
          reservationId: null,
          updatedAt: now,
        });
      }
    }
  });
}

// Idempotent — safe to call multiple times for the same reservation (Stripe
// may deliver the same webhook event more than once).
export async function markReservationPaid(
  reservationId: string,
  stripe: { checkoutSessionId?: string; paymentIntentId?: string }
): Promise<void> {
  const db = getAdminDb();
  const reservationRef = db.collection("reservations").doc(reservationId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reservationRef);
    if (!snap.exists) return;
    const reservation = snap.data() as Reservation;

    if (reservation.status === "paid") return; // already processed — idempotent no-op

    const now = Date.now();
    tx.update(reservationRef, {
      status: "paid",
      paymentStatus: "paid",
      paidAt: now,
      updatedAt: now,
      ...(stripe.checkoutSessionId ? { stripeCheckoutSessionId: stripe.checkoutSessionId } : {}),
      ...(stripe.paymentIntentId ? { stripePaymentIntentId: stripe.paymentIntentId } : {}),
    });

    const eventBoothRef = db
      .collection("eventBooths")
      .doc(eventBoothDocId(reservation.eventId, reservation.boothId));
    tx.update(eventBoothRef, {
      status: "sold",
      heldUntil: null,
      updatedAt: now,
    });
  });
}

// Idempotent — releases a booth whose checkout expired without payment.
// Never touches a booth that has already transitioned to sold.
export async function expireReservation(reservationId: string): Promise<void> {
  const db = getAdminDb();
  const reservationRef = db.collection("reservations").doc(reservationId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reservationRef);
    if (!snap.exists) return;
    const reservation = snap.data() as Reservation;

    if (reservation.status === "paid") return;
    if (reservation.status === "expired" || reservation.status === "cancelled") return;

    const now = Date.now();
    tx.update(reservationRef, { status: "expired", paymentStatus: "failed", cancelledAt: now, updatedAt: now });

    const eventBoothRef = db
      .collection("eventBooths")
      .doc(eventBoothDocId(reservation.eventId, reservation.boothId));
    const eventBoothSnap = await tx.get(eventBoothRef);
    if (eventBoothSnap.exists) {
      const eventBooth = eventBoothSnap.data() as EventBooth;
      if (eventBooth.status === "held" && eventBooth.reservationId === reservationId) {
        tx.update(eventBoothRef, {
          status: "available",
          heldUntil: null,
          reservationId: null,
          updatedAt: now,
        });
      }
    }
  });
}

export async function findReservationByCheckoutSession(
  checkoutSessionId: string
): Promise<Reservation | null> {
  const db = getAdminDb();
  const snap = await db
    .collection("reservations")
    .where("stripeCheckoutSessionId", "==", checkoutSessionId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0]!.data() as Reservation;
}

export async function getReservation(reservationId: string): Promise<Reservation | null> {
  const db = getAdminDb();
  const snap = await db.collection("reservations").doc(reservationId).get();
  if (!snap.exists) return null;
  return snap.data() as Reservation;
}
