import ReservationApp from "@/components/fuego/ReservationApp";

export default function ReservePage({
  searchParams,
}: {
  searchParams: { event?: string; section?: string };
}) {
  return <ReservationApp initialEventSlug={searchParams.event} initialBoothId={searchParams.section} />;
}
