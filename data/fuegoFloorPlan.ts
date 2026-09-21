export type BoothCategory = "vip" | "main-floor";

export type Hotspot = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BoothDefinition = {
  id: string;
  name: string;
  category: BoothCategory;
  defaultCapacity: number;
  defaultPriceCents: number;
  description: string;
  hotspot: Hotspot;
};

// Percentage-based coordinates over the 1536x1024 floor plan image
// (public/images/fuego-floor-plan.png). Adjust freely — see
// components/fuego/BoothHotspot.tsx calibration mode for a visual editor.
export const FUEGO_FLOOR_PLAN_IMAGE = "/images/fuego-floor-plan.png";
export const FUEGO_FLOOR_PLAN_ASPECT = { width: 1536, height: 1024 };

export const FUEGO_BOOTHS: BoothDefinition[] = [
  {
    id: "vip-1",
    name: "VIP 1",
    category: "vip",
    defaultCapacity: 10,
    defaultPriceCents: 25000,
    description: "Premium VIP booth along the main wall with dedicated bottle service.",
    hotspot: { left: 1.0, top: 51.5, width: 15.0, height: 16.5 },
  },
  {
    id: "vip-2",
    name: "VIP 2",
    category: "vip",
    defaultCapacity: 10,
    defaultPriceCents: 25000,
    description: "Premium VIP booth along the main wall with dedicated bottle service.",
    hotspot: { left: 2.5, top: 30.5, width: 13.5, height: 15.5 },
  },
  {
    id: "vip-3",
    name: "VIP 3",
    category: "vip",
    defaultCapacity: 10,
    defaultPriceCents: 25000,
    description: "Premium VIP booth along the main wall with dedicated bottle service.",
    hotspot: { left: 3.5, top: 10.5, width: 12.5, height: 15.5 },
  },
  {
    id: "vip-4",
    name: "VIP 4",
    category: "vip",
    defaultCapacity: 10,
    defaultPriceCents: 25000,
    description: "Corner VIP booth on the upper deck with an elevated view of the floor.",
    hotspot: { left: 22.5, top: 2.0, width: 16.5, height: 18.5 },
  },
  {
    id: "vip-5",
    name: "VIP 5",
    category: "vip",
    defaultCapacity: 15,
    defaultPriceCents: 35000,
    description: "Signature center-stage VIP booth on the Upper Deck — the best view in the house.",
    hotspot: { left: 40.0, top: 1.0, width: 19.5, height: 21.5 },
  },
  {
    id: "vip-6",
    name: "VIP 6",
    category: "vip",
    defaultCapacity: 10,
    defaultPriceCents: 25000,
    description: "Corner VIP booth on the upper deck with an elevated view of the floor.",
    hotspot: { left: 60.5, top: 2.0, width: 16.5, height: 18.5 },
  },
  {
    id: "vip-7",
    name: "VIP 7",
    category: "vip",
    defaultCapacity: 15,
    defaultPriceCents: 35000,
    description: "Prime VIP section next to the DJ booth with premium bottle service.",
    hotspot: { left: 80.5, top: 16.5, width: 9.0, height: 45.0 },
  },
  {
    id: "m1",
    name: "M1",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth with easy access to the bar and dance floor.",
    hotspot: { left: 36.5, top: 54.0, width: 11.5, height: 12.5 },
  },
  {
    id: "m2",
    name: "M2",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth with easy access to the bar and dance floor.",
    hotspot: { left: 51.5, top: 54.0, width: 11.5, height: 12.5 },
  },
  {
    id: "m3",
    name: "M3",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth with easy access to the bar and dance floor.",
    hotspot: { left: 22.5, top: 42.0, width: 7.5, height: 24.5 },
  },
  {
    id: "m4",
    name: "M4",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth just below the Upper Deck.",
    hotspot: { left: 27.0, top: 25.0, width: 13.5, height: 14.0 },
  },
  {
    id: "m5",
    name: "M5",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth just below the Upper Deck.",
    hotspot: { left: 43.0, top: 25.0, width: 13.0, height: 14.0 },
  },
  {
    id: "m6",
    name: "M6",
    category: "main-floor",
    defaultCapacity: 6,
    defaultPriceCents: 15000,
    description: "Main floor booth just below the Upper Deck.",
    hotspot: { left: 59.0, top: 25.0, width: 13.5, height: 14.0 },
  },
];

export const FUEGO_BOOTH_MAP: Record<string, BoothDefinition> = Object.fromEntries(
  FUEGO_BOOTHS.map((b) => [b.id, b])
);

export function getBoothDefinition(boothId: string): BoothDefinition | undefined {
  return FUEGO_BOOTH_MAP[boothId];
}
