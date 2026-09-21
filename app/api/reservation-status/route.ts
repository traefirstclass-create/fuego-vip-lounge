import { NextResponse } from "next/server";
import { findReservationByCheckoutSession } from "@/lib/reservations";
import { getBoothDefinition } from "@/data/fuegoFloorPlan";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { FuegoEvent } from "@/lib/types";

export const runtime = "nodejs";

// Never trusts the success URL itself — looks up the authoritative
// reservation/webhook-confirmed state in Firestore and returns only a
// non-sensitive summary (no phone number, no raw Stripe identifiers).
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const reservation = await findReservationByCheckoutSession(sessionId);
  if (!reservation) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  const boothDef = getBoothDefinition(reservation.boothId);
  const eventSnap = await getAdminDb().collection("events").doc(reservation.eventId).get();
  const event = eventSnap.exists ? (eventSnap.data() as FuegoEvent) : null;

  if (reservation.status !== "paid") {
    return NextResponse.json({ status: reservation.status === "expired" ? "expired" : "pending" });
  }

  return NextResponse.json({
    status: "paid",
    confirmationNumber: reservation.confirmationNumber,
    boothName: boothDef?.name ?? reservation.boothId,
    eventName: event?.name ?? "",
    eventDate: event?.eventDate ?? "",
    guestCount: reservation.guestCount,
    amount: reservation.amount,
  });
}
