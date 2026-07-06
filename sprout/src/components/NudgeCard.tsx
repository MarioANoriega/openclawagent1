export function NudgeCard({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-card bg-sun-soft px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile bg-sun/25 text-[18px]"
        aria-hidden="true"
      >
        💧
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-ink">{title}</span>
        <span className="block text-[12.5px] font-medium text-ink2/80">{subtitle}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-ink2/60">
        <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
