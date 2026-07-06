import type { Garden } from "../lib/store";

export function ComingSoon({ emoji, title, note }: { emoji: string; title: string; note: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-10 text-center">
      <span className="text-[44px]" aria-hidden="true">{emoji}</span>
      <h1 className="font-display text-[22px] font-bold text-ink">{title}</h1>
      <p className="text-[14px] leading-relaxed font-medium text-muted">{note}</p>
    </div>
  );
}

export function You({ garden }: { garden: Garden }) {
  const name = garden.state.name ?? "Friend";
  return (
    <div className="flex flex-1 flex-col items-center gap-5 px-7 pt-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-sprout to-sprout-deep font-display text-[32px] font-bold text-white">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="text-center">
        <h1 className="font-display text-[22px] font-bold text-ink">{name}</h1>
        <p className="mt-1 text-[13.5px] font-medium text-muted">
          Gardener since today · {garden.state.demo ? "demo garden" : "fresh garden"}
        </p>
      </div>
      <button
        onClick={() => {
          if (window.confirm("Clear this garden and start over from the first seed?")) {
            garden.resetGarden();
          }
        }}
        className="mt-4 rounded-action bg-card px-6 py-3 text-[14px] font-bold text-clay shadow-leaf"
      >
        Start a fresh garden
      </button>
    </div>
  );
}
