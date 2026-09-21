const ITEMS = [
  { label: "Available", swatch: "border border-fuego-gold/50 bg-transparent" },
  { label: "Selected", swatch: "border-2 border-fuego-goldBright bg-fuego-gold/25 shadow-gold" },
  { label: "Temporarily Held", swatch: "border border-fuego-red/60 bg-fuego-red/10" },
  { label: "Sold", swatch: "border border-white/10 bg-black/60" },
];

export default function AvailabilityLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70">
      {ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`h-3.5 w-3.5 rounded-sm ${item.swatch}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
