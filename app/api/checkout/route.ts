import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBoothDefinition } from "@/data/fuegoFloorPlan";
import {
  attachCheckoutSession,
  createHold,
  HOLD_DURATION_MS,
  releaseHoldForReservation,
  ReservationError,
} from "@/lib/reservations";

export const runtime = "nodejs";

type CheckoutBody = {
  eventId?: unknown;
  boothId?: unknown;
  guestName?: unknown;
  guestCount?: unknown;
  phoneNumber?: unknown;
};

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const boothId = typeof body.boothId === "string" ? body.boothId : "";
  const guestName = typeof body.guestName === "string" ? body.guestName : "";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber : "";
  const guestCount = typeof body.guestCount === "number" ? body.guestCount : Number(body.guestCount);

  if (!eventId || !boothId) {
    return NextResponse.json({ error: "Missing event or section." }, { status: 400 });
  }

  const boothDef = getBoothDefinition(boothId);
  if (!boothDef) {
    return NextResponse.json({ error: "This section does not exist." }, { status: 404 });
  }

  let hold;
  try {
    // Server determines price/capacity from authoritative event inventory —
    // any client-supplied price is ignored entirely (it's never read here).
    hold = await createHold({ eventId, boothId, guestName, guestCount, phoneNumber });
  } catch (err) {
    if (err instanceof ReservationError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("createHold failed", err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: hold.amount,
            product_data: {
              name: `${hold.boothName} — ${hold.eventName}`,
              description: `${hold.eventDate} · Reservation ${hold.confirmationNumber}`,
            },
          },
        },
      ],
      metadata: {
        reservationId: hold.reservationId,
        eventId,
        boothId,
      },
      success_url: `${siteUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/reservation/cancelled`,
      expires_at: Math.floor((Date.now() + HOLD_DURATION_MS) / 1000),
    });

    await attachCheckoutSession(hold.reservationId, session.id);

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed", err);
    await releaseHoldForReservation(hold.reservationId).catch((releaseErr) => {
      console.error("Failed to release hold after Stripe failure", releaseErr);
    });
    return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 502 });
  }
}
