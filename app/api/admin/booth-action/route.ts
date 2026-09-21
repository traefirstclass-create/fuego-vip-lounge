import { NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/adminAuth";
import { adminReleaseBooth, setEventActive } from "@/lib/events";
import { ReservationError } from "@/lib/reservations";

export const runtime = "nodejs";

type BoothActionBody = {
  action?: unknown;
  eventId?: unknown;
  boothId?: unknown;
  active?: unknown;
};

export async function POST(req: Request) {
  try {
    await requireAdmin(req.headers.get("authorization"));
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  let body: BoothActionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId." }, { status: 400 });
  }

  try {
    if (body.action === "release") {
      const boothId = typeof body.boothId === "string" ? body.boothId : "";
      if (!boothId) return NextResponse.json({ error: "Missing boothId." }, { status: 400 });
      await adminReleaseBooth(eventId, boothId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "setEventActive") {
      await setEventActive(eventId, Boolean(body.active));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    if (err instanceof ReservationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin booth-action failed", err);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
