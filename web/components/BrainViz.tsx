// Stylized fMRI-brain stand-in. The real site uses medical brain-scan renders
// (sagittal + coronal). Those exact images aren't reproducible here, so this is
// an abstract SVG evocation in the same warm-orange fMRI palette. Swap in the
// real asset for a pixel-faithful build.
export default function BrainViz({ size = 440 }: { size?: number }) {
  return (
    <svg
      className="hero-brain"
      viewBox="0 0 440 440"
      width={size}
      role="img"
      aria-label="fMRI brain activation"
    >
      <defs>
        <radialGradient id="brainCore" cx="52%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="35%" stopColor="#f2b35e" />
          <stop offset="70%" stopColor="#d9822b" />
          <stop offset="100%" stopColor="#7c5a2e" />
        </radialGradient>
        <radialGradient id="brainHead" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#cfd8d6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9aa7a6" stopOpacity="0.15" />
        </radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="1.1" /></filter>
      </defs>

      {/* translucent head / skull */}
      <ellipse cx="220" cy="230" rx="170" ry="195" fill="url(#brainHead)" />

      {/* brain mass */}
      <g filter="url(#soft)">
        <path
          d="M150 150
             q-40 15 -38 60 q-30 25 -8 62 q-8 40 40 48 q20 30 62 20
             q40 22 78 -6 q44 -2 46 -46 q26 -28 4 -60 q6 -42 -40 -52
             q-22 -28 -62 -20 q-46 -20 -84 -6 z"
          fill="url(#brainCore)"
        />
        {/* gyri / sulci folds */}
        {[
          "M170 170 q20 20 6 44 q22 14 4 40",
          "M212 158 q10 30 -4 54 q18 22 0 44",
          "M258 166 q16 22 2 46 q20 18 2 42",
          "M300 182 q10 24 -6 44",
          "M150 214 q26 8 30 34 q26 6 24 34",
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#8a5220" strokeOpacity="0.55" strokeWidth="3" />
        ))}
      </g>

      {/* brainstem */}
      <path d="M214 340 q6 40 -6 74 q18 6 30 -2 q-6 -38 2 -70 z" fill="url(#brainCore)" opacity="0.9" />
    </svg>
  );
}
