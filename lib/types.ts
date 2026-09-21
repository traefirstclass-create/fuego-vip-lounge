export type BoothStatus = "available" | "held" | "sold" | "disabled";

export type FuegoEvent = {
  id: string;
  name: string;
  slug: string;
  eventDate: string; // ISO date, e.g. "2026-08-29"
  startTime: string; // e.g. "22:00"
  endTime: string; // e.g. "06:00"
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type EventBooth = {
  eventId: string;
  boothId: string;
  price: number; // cents
  minimumSpend: number | null; // cents
  capacity: number;
  status: BoothStatus;
  heldUntil: number | null;
  reservationId: string | null;
  active: boolean;
  updatedAt: number;
};

// Public-safe projection of EventBooth — no guest PII, ever.
export type PublicEventBooth = Pick<
  EventBooth,
  "eventId" | "boothId" | "price" | "minimumSpend" | "capacity" | "status" | "active"
> & {
  heldUntil: number | null;
};

export type ReservationStatus = "pending_payment" | "held" | "paid" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Reservation = {
  id: string;
  confirmationNumber: string;

  eventId: string;
  boothId: string;

  guestName: string;
  guestCount: number;
  phoneNumber: string;

  status: ReservationStatus;
  paymentStatus: PaymentStatus;

  amount: number; // cents

  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;

  heldAt: number | null;
  heldUntil: number | null;
  paidAt: number | null;
  cancelledAt: number | null;

  createdAt: number;
  updatedAt: number;
};
