import { getAdminDb } from "@/lib/firebaseAdmin";
import { FUEGO_BOOTHS } from "@/data/fuegoFloorPlan";
import { eventBoothDocId, ReservationError } from "@/lib/reservations";
import type { EventBooth, FuegoEvent } from "@/lib/types";

export type CreateEventInput = {
  name: string;
  slug: string;
  eventDate: string;
  startTime: string;
  endTime: string;
};

// Creates an event and seeds event-specific inventory for all 13 bookable
// sections from their default price/capacity — so a new night never
// requires hand-writing 13 database rows.
export async function createEventWithInventory(input: CreateEventInput): Promise<FuegoEvent> {
  const db = getAdminDb();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!slug) {
    throw new ReservationError("invalid_slug", "Please provide a valid event slug.");
  }

  const eventRef = db.collection("events").doc(slug);
  const existing = await eventRef.get();
  if (existing.exists) {
    throw new ReservationError("duplicate_event", "An event with this slug already exists.", 409);
  }

  const now = Date.now();
  const event: FuegoEvent = {
    id: slug,
    name: input.name.trim(),
    slug,
    eventDate: input.eventDate,
    startTime: input.startTime,
    endTime: input.endTime,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const batch = db.batch();
  batch.set(eventRef, event);

  for (const booth of FUEGO_BOOTHS) {
    const eventBooth: EventBooth = {
      eventId: slug,
      boothId: booth.id,
      price: booth.defaultPriceCents,
      minimumSpend: null,
      capacity: booth.defaultCapacity,
      status: "available",
      heldUntil: null,
      reservationId: null,
      active: true,
      updatedAt: now,
    };
    batch.set(db.collection("eventBooths").doc(eventBoothDocId(slug, booth.id)), eventBooth);
  }

  await batch.commit();
  return event;
}

export async function setEventActive(eventId: string, active: boolean): Promise<void> {
  const db = getAdminDb();
  await db.collection("events").doc(eventId).update({ active, updatedAt: Date.now() });
}

// Admin-only manual recovery: force a held/sold booth back to available,
// cancelling any reservation currently attached to it. Use for stuck holds
// or to reverse a mistaken sale.
export async function adminReleaseBooth(eventId: string, boothId: string): Promise<void> {
  const db = getAdminDb();
  const eventBoothRef = db.collection("eventBooths").doc(eventBoothDocId(eventId, boothId));

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(eventBoothRef);
    if (!snap.exists) throw new ReservationError("invalid_booth", "This section does not exist.", 404);
    const eventBooth = snap.data() as EventBooth;
    const now = Date.now();

    if (eventBooth.reservationId) {
      const reservationRef = db.collection("reservations").doc(eventBooth.reservationId);
      const reservationSnap = await tx.get(reservationRef);
      if (reservationSnap.exists) {
        tx.update(reservationRef, { status: "cancelled", cancelledAt: now, updatedAt: now });
      }
    }

    tx.update(eventBoothRef, {
      status: "available",
      heldUntil: null,
      reservationId: null,
      updatedAt: now,
    });
  });
}
