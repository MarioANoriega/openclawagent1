/**
 * The brand mark: a small two-leaf sprout. Sits at the tip of every
 * growth line and on the primary CTA.
 */
export function SproutGlyph({
  size = 18,
  color = "var(--sprout)",
  stem = color,
  className,
}: {
  size?: number;
  color?: string;
  stem?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 21.5c0-5.5.4-8.5 1.6-11"
        stroke={stem}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12.6 12.6C12.2 8.9 9.5 6.3 4.9 5.9c-.3 0-.5.2-.5.5.3 4.7 3.2 7.1 7.7 6.9.3 0 .5-.3.5-.7Z"
        fill={color}
      />
      <path
        d="M13.7 10.4c.1-3.2 2.3-5.7 6.3-6.3.3 0 .5.2.5.4-.2 4.1-2.7 6.3-6.3 6.4-.3 0-.5-.2-.5-.5Z"
        fill={color}
      />
    </svg>
  );
}
