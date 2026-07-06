import type { ReactNode } from "react";

export type QuickAction = "add" | "invest" | "send" | "more";

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 4.5v13M4.5 11h13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c0-8 4-13 14-14-.5 10-5.5 14-13 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19c3-4 6-7 10-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M6.5 15.5 15.5 6.5M8 6.5h7.5V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="11" r="1.8" />
      <circle cx="11" cy="11" r="1.8" />
      <circle cx="17" cy="11" r="1.8" />
    </svg>
  );
}

function ActionButton({
  label,
  icon,
  primary = false,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-2">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-action transition-transform group-active:scale-95 ${
          primary
            ? "bg-sprout text-white shadow-glow"
            : "bg-card text-ink2 shadow-leaf"
        }`}
      >
        {icon}
      </span>
      <span className="text-[12px] font-semibold text-ink2">{label}</span>
    </button>
  );
}

export function QuickActions({ onAction }: { onAction: (a: QuickAction) => void }) {
  return (
    <nav className="flex justify-between px-3" aria-label="Quick actions">
      <ActionButton label="Add" icon={<PlusIcon />} primary onClick={() => onAction("add")} />
      <ActionButton label="Invest" icon={<LeafIcon />} onClick={() => onAction("invest")} />
      <ActionButton label="Send" icon={<SendIcon />} onClick={() => onAction("send")} />
      <ActionButton label="More" icon={<MoreIcon />} onClick={() => onAction("more")} />
    </nav>
  );
}
