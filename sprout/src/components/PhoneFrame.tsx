import type { ReactNode } from "react";

/**
 * Centers the app in a phone-sized frame on desktop; collapses to
 * full-bleed on small screens (≤430px).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh sm:flex sm:items-center sm:justify-center sm:bg-[#DFE6D6] sm:p-6">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-paper sm:h-[min(844px,92dvh)] sm:w-[390px] sm:rounded-[40px] sm:border-[8px] sm:border-ink sm:shadow-[0_30px_80px_rgba(23,38,29,0.35)]">
        {children}
      </div>
    </div>
  );
}
