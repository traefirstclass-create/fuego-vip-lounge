"use client";

import type { BoothDefinition } from "@/data/fuegoFloorPlan";
import type { BoothStatus } from "@/lib/types";

export const SHOW_HOTSPOTS = process.env.NODE_ENV === "development";

export type DisplayStatus = BoothStatus | "loading";

type BoothHotspotProps = {
  booth: BoothDefinition;
  status: DisplayStatus;
  selected: boolean;
  onSelect: (boothId: string) => void;
  calibration?: boolean;
};

const STATUS_LABEL: Record<DisplayStatus, string> = {
  loading: "Checking availability",
  available: "Available",
  held: "Temporarily held",
  sold: "Sold",
  disabled: "Not bookable",
};

export default function BoothHotspot({ booth, status, selected, onSelect, calibration }: BoothHotspotProps) {
  const { hotspot } = booth;
  const isInteractive = status === "available" || status === "held" || status === "sold";

  const label =
    status === "available"
      ? `Reserve ${booth.name}`
      : `${booth.name} — ${STATUS_LABEL[status]}`;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={status === "loading" || status === "disabled"}
      onClick={() => isInteractive && onSelect(booth.id)}
      className={[
        "group absolute rounded-md transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-fuego-goldBright focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        status === "available" ? "cursor-pointer" : status === "loading" || status === "disabled" ? "cursor-default" : "cursor-pointer",
        status === "loading" && "bg-white/5 animate-pulse",
        status === "available" && !selected && "hover:bg-fuego-gold/20 hover:shadow-gold",
        selected && "bg-fuego-gold/25 shadow-gold ring-2 ring-fuego-goldBright",
        status === "held" && !selected && "bg-fuego-red/10",
        status === "sold" && !selected && "bg-black/40",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${hotspot.left}%`,
        top: `${hotspot.top}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
      }}
    >
      {status === "held" && (
        <span className="pointer-events-none absolute inset-x-0 top-1 flex justify-center">
          <span className="rounded bg-fuego-red/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:text-[10px]">
            Held
          </span>
        </span>
      )}
      {status === "sold" && (
        <span className="pointer-events-none absolute inset-x-0 top-1 flex justify-center">
          <span className="rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-fuego-redBright sm:text-[10px]">
            Sold
          </span>
        </span>
      )}

      {(calibration ?? SHOW_HOTSPOTS) && (
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-emerald-400/80 bg-emerald-400/10 text-center">
          <span className="text-[10px] font-bold text-emerald-300">{booth.name}</span>
          <span className="text-[8px] text-emerald-200">
            L{hotspot.left.toFixed(1)} T{hotspot.top.toFixed(1)}
          </span>
          <span className="text-[8px] text-emerald-200">
            W{hotspot.width.toFixed(1)} H{hotspot.height.toFixed(1)}
          </span>
        </span>
      )}
    </button>
  );
}
