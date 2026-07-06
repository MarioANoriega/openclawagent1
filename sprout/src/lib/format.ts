const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function money(n: number): string {
  return usd.format(n);
}

export function moneyWhole(n: number): string {
  return usdWhole.format(n);
}

export function signedMoney(n: number): string {
  return `${n >= 0 ? "+" : "−"}${usd.format(Math.abs(n))}`;
}

export function signedPct(n: number): string {
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;
}

/** Split a dollar amount into whole and cents parts for the hero. */
export function moneyParts(n: number): { whole: string; cents: string } {
  const [whole, cents] = usd.format(n).split(".");
  return { whole, cents: `.${cents}` };
}
