export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[30px] w-[52px] shrink-0 rounded-pill transition-colors ${
        on ? "bg-sprout" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-sm transition-[left] ${
          on ? "left-[25px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
