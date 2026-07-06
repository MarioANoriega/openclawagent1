import type { ReactNode } from "react";

export type Tab = "garden" | "explore" | "grow" | "you";

function GardenIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21v-6m0 0c0-4-2.6-6.4-7-6.8.3 4.6 3 7 7 6.8Zm0-2.5c.2-3.4 2.5-5.6 6.5-6-.3 4.3-2.8 6.3-6.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GrowIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 17.5 9 12l3.5 3.5L20 8m0 0h-4.5M20 8v4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function YouIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "garden", label: "Garden", icon: <GardenIcon /> },
  { id: "explore", label: "Explore", icon: <ExploreIcon /> },
  { id: "grow", label: "Grow", icon: <GrowIcon /> },
  { id: "you", label: "You", icon: <YouIcon /> },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="flex shrink-0 items-stretch justify-around border-t border-line bg-card/95 px-2 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))] backdrop-blur"
      aria-label="Main"
    >
      {TABS.map(({ id, label, icon }) => {
        const active = id === tab;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-tile px-4 py-1 text-[11px] font-semibold transition-colors ${
              active ? "text-sprout-deep" : "text-muted2 hover:text-muted"
            }`}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </nav>
  );
}
