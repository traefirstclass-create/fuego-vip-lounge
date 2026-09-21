import Link from "next/link";

export default function ReservationCancelledPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-fuego-gold">Checkout Not Completed</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Your Reservation Wasn&rsquo;t Completed</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">
        Checkout was cancelled and your card was not charged. The section you selected has been released back to
        the floor plan and may now be reserved by another guest.
      </p>
      <Link
        href="/reserve"
        className="mt-8 inline-block rounded-md bg-gradient-to-b from-fuego-goldBright to-fuego-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-[1.02]"
      >
        Return to Floor Plan
      </Link>
    </div>
  );
}
