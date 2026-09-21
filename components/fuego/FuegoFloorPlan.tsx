"use client";

import Image from "next/image";
import { FUEGO_BOOTHS, FUEGO_FLOOR_PLAN_ASPECT, FUEGO_FLOOR_PLAN_IMAGE } from "@/data/fuegoFloorPlan";
import BoothHotspot, { type DisplayStatus } from "@/components/fuego/BoothHotspot";

type FuegoFloorPlanProps = {
  statusFor: (boothId: string) => DisplayStatus;
  selectedBoothId: string | null;
  onSelect: (boothId: string) => void;
  calibration?: boolean;
};

export default function FuegoFloorPlan({ statusFor, selectedBoothId, onSelect, calibration }: FuegoFloorPlanProps) {
  return (
    <div className="relative w-full select-none rounded-xl border border-fuego-gold/20 bg-black shadow-2xl overflow-hidden">
      <Image
        src={FUEGO_FLOOR_PLAN_IMAGE}
        alt="Fuego VIP Lounge interactive floor plan — click a section to reserve"
        width={FUEGO_FLOOR_PLAN_ASPECT.width}
        height={FUEGO_FLOOR_PLAN_ASPECT.height}
        className="h-auto w-full"
        priority
      />
      <div className="absolute inset-0">
        {FUEGO_BOOTHS.map((booth) => (
          <BoothHotspot
            key={booth.id}
            booth={booth}
            status={statusFor(booth.id)}
            selected={selectedBoothId === booth.id}
            onSelect={onSelect}
            calibration={calibration}
          />
        ))}
      </div>
    </div>
  );
}
