import { useState } from "react";
import { SproutGlyph } from "../components/SproutGlyph";

export function Onboarding({ onBegin }: { onBegin: (name: string, demo: boolean) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto px-7 pt-16 pb-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="shadow-leaf flex h-20 w-20 items-center justify-center rounded-[24px] bg-card">
          <SproutGlyph size={44} />
        </span>
        <div>
          <h1 className="font-display text-[30px] leading-tight font-bold tracking-tight text-ink">
            Grow your money,
            <br />
            one seed at a time.
          </h1>
          <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-relaxed font-medium text-muted">
            Sprout turns investing into gardening — plant seeds, water them weekly, and watch
            your garden grow.
          </p>
        </div>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onBegin(name, false);
        }}
      >
        <label htmlFor="gardener-name" className="text-[13px] font-semibold text-ink2">
          What should we call you?
        </label>
        <input
          id="gardener-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          autoComplete="given-name"
          maxLength={24}
          className="rounded-card border border-line bg-card px-4 py-3.5 text-[16px] font-semibold text-ink placeholder:text-muted2"
        />
        <button
          type="submit"
          className="shadow-glow mt-1 rounded-action bg-sprout py-4 text-[16px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          Start growing 🌱
        </button>
        <button
          type="button"
          onClick={() => onBegin(name || "Maya", true)}
          className="py-2 text-[13.5px] font-semibold text-sprout-deep"
        >
          Peek at a grown garden instead
        </button>
      </form>
    </div>
  );
}
