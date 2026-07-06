export function StatTile({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "sprout" | "clay";
}) {
  return (
    <div className="flex-1 rounded-tile bg-card px-3 py-3 text-center shadow-leaf">
      <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p
        className={`tnum mt-1 font-display text-[17px] font-bold ${
          tone === "sprout" ? "text-sprout-deep" : tone === "clay" ? "text-clay" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
