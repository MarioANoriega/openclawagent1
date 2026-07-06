import { useRef } from "react";

const QUICK_AMOUNTS = [25, 50, 100, 250];

/**
 * Big centered amount for the "Plant a seed" sheet. The number itself is
 * an input (tap to type a custom amount); pills below set it in one tap.
 */
export function AmountEntry({
  amount,
  onChange,
  caption,
  error,
}: {
  amount: number;
  onChange: (n: number) => void;
  caption: string;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-baseline justify-center gap-1"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="font-display text-[34px] font-semibold text-muted2" aria-hidden="true">
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label="Amount in dollars"
          aria-invalid={!!error}
          aria-describedby={error ? "amount-error" : undefined}
          value={amount === 0 ? "" : String(amount)}
          placeholder="0"
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
            const n = parseFloat(cleaned);
            onChange(Number.isFinite(n) ? Math.min(999999, n) : 0);
          }}
          size={Math.max(1, String(amount || 0).length)}
          className="tnum w-auto min-w-[1ch] border-none bg-transparent p-0 text-center font-display text-[56px] leading-none font-bold text-ink outline-none placeholder:text-muted2 focus:outline-none"
          style={{ width: `${Math.max(1, String(amount || 0).length)}ch` }}
        />
      </div>
      <p className="tnum text-[13px] font-medium text-muted">{caption}</p>
      {error && (
        <p
          id="amount-error"
          role="alert"
          className="rounded-tile bg-clay/10 px-3 py-1.5 text-[13px] font-semibold text-clay"
        >
          {error}
        </p>
      )}
      <div className="flex gap-2" role="group" aria-label="Quick amounts">
        {QUICK_AMOUNTS.map((q) => {
          const active = amount === q;
          return (
            <button
              key={q}
              onClick={() => onChange(q)}
              aria-pressed={active}
              className={`tnum rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors ${
                active
                  ? "bg-ink text-card"
                  : "bg-sky text-ink2 hover:bg-sprout-soft"
              }`}
            >
              ${q}
            </button>
          );
        })}
      </div>
    </div>
  );
}
