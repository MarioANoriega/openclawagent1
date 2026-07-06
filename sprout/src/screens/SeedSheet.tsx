import { useEffect, useState } from "react";
import type { PlantView } from "../lib/store";
import { Sheet } from "../components/Sheet";
import { AmountEntry } from "../components/AmountEntry";
import { Toggle } from "../components/Toggle";
import { SproutGlyph } from "../components/SproutGlyph";
import { money } from "../lib/format";

export interface SeedRequest {
  targetId: string;
  amount?: number;
  water?: boolean;
}

export function SeedSheet({
  request,
  target,
  cashAvailable,
  onClose,
  onConfirm,
}: {
  request: SeedRequest | null;
  target: PlantView | null;
  cashAvailable: number;
  onClose: () => void;
  onConfirm: (amount: number, water: boolean) => void;
}) {
  const open = request != null && target != null;
  const [amount, setAmount] = useState(50);
  const [water, setWater] = useState(false);
  const [planted, setPlanted] = useState(false);

  // Reset the form each time the sheet opens for a new request.
  useEffect(() => {
    if (request) {
      setAmount(request.amount ?? 50);
      setWater(request.water ?? false);
      setPlanted(false);
    }
  }, [request]);

  useEffect(() => {
    if (!planted) return;
    const t = setTimeout(onClose, 1300);
    return () => clearTimeout(t);
  }, [planted, onClose]);

  if (!open || !target) return null;

  const isCash = !!target.plant.isCash;
  const overdrawn = !isCash && amount > cashAvailable + 0.005;
  const error = overdrawn
    ? `Not enough cash seeds — you have ${money(cashAvailable)} ready to plant.`
    : null;
  const canPlant = amount > 0 && !error;

  const confirm = () => {
    if (!canPlant) return;
    onConfirm(amount, water);
    setPlanted(true);
  };

  return (
    <Sheet open onClose={planted ? () => {} : onClose} label="Plant a seed">
      {planted ? (
        <div className="anim-rise flex flex-col items-center gap-3 py-12 text-center" role="status">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sprout-soft">
            <SproutGlyph size={34} />
          </span>
          <p className="font-display text-[22px] font-bold text-ink">Planted!</p>
          <p className="tnum text-[14px] font-medium text-muted">
            {money(amount)} {isCash ? "added to your cash seeds" : `is growing in ${target.plant.name}`}
          </p>
        </div>
      ) : (
        <>
          <header className="text-center">
            <h2 className="font-display text-[20px] font-bold text-ink">
              {isCash ? "Add cash seeds 🌰" : "Plant a seed 🌱"}
            </h2>
            <p className="mt-0.5 text-[13.5px] font-medium text-muted">
              Into {target.plant.name}
            </p>
          </header>

          <div className="mt-7">
            <AmountEntry
              amount={amount}
              onChange={setAmount}
              caption={
                isCash
                  ? "straight from your bank"
                  : `${money(cashAvailable)} cash seeds available`
              }
              error={error}
            />
          </div>

          <div className="mt-7 flex flex-col gap-2">
            {!isCash && (
              <div className="flex items-center justify-between rounded-card bg-sky px-4 py-3.5">
                <div>
                  <p className="text-[14px] font-bold text-ink">Water weekly</p>
                  <p className="tnum text-[12.5px] font-medium text-muted">
                    Auto-plant {money(target.weeklyAmount)} every week
                  </p>
                </div>
                <Toggle on={water} onChange={setWater} label="Water weekly" />
              </div>
            )}

            <button className="flex w-full items-center justify-between rounded-card bg-sky px-4 py-3.5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-tile bg-card text-[16px]" aria-hidden="true">
                  🏦
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink">Sprout Bank</p>
                  <p className="tnum text-[12.5px] font-medium text-muted">Checking ••1234</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-muted">
                <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <button
            onClick={confirm}
            disabled={!canPlant}
            className="tnum shadow-glow mt-6 flex w-full items-center justify-center gap-2 rounded-action bg-sprout py-4 text-[16px] font-bold text-white transition-transform active:scale-[0.98] disabled:bg-muted2 disabled:shadow-none"
          >
            <SproutGlyph size={18} color="#fff" />
            Plant {money(amount || 0)}
          </button>
        </>
      )}
    </Sheet>
  );
}
