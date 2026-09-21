import { NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/adminAuth";
import { createEventWithInventory } from "@/lib/events";
import { ReservationError } from "@/lib/reservations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireAdmin(req.headers.get("authorization"));
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  const eventDate = typeof body.eventDate === "string" ? body.eventDate : "";
  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  const endTime = typeof body.endTime === "string" ? body.endTime : "";

  if (!name || !slug || !eventDate) {
    return NextResponse.json({ error: "Name, slug, and event date are required." }, { status: 400 });
  }

  try {
    const event = await createEventWithInventory({ name, slug, eventDate, startTime, endTime });
    return NextResponse.json({ event });
  } catch (err) {
    if (err instanceof ReservationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("createEventWithInventory failed", err);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}
