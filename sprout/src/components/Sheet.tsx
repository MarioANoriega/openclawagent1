import { useEffect, useRef, type ReactNode } from "react";

/** Bottom sheet with backdrop, grab handle, and Escape-to-close. */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="anim-backdrop absolute inset-0 cursor-default bg-ink/35"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="anim-sheet shadow-sheet relative max-h-[92%] overflow-y-auto rounded-t-[26px] bg-card px-5 pt-3 pb-6 outline-none"
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-pill bg-line" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
