import { useEffect } from "react";

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-8">
      <p
        role="status"
        className="anim-rise rounded-pill bg-ink px-4 py-2.5 text-center text-[13px] font-semibold text-card shadow-leaf"
      >
        {message}
      </p>
    </div>
  );
}
