/**
 * Self-contained celestial backdrop: a bright dreamy-sky gradient, luminous
 * nebula glows, procedurally generated clouds (SVG fractal-noise turbulence —
 * no image files), a crescent moon, and scattered stars. Sits behind the whole
 * app; the frosted-glass UI floats on top. Purely decorative.
 */

// Deterministic scattered stars (fixed seed so they don't jump between renders).
const STARS = Array.from({ length: 70 }, (_, i) => {
  const frac = (n: number) => {
    const v = Math.sin(n) * 43758.5453;
    return v - Math.floor(v);
  };
  const t = frac(i * 12.9898);
  return {
    x: frac(i * 7.13 + 1) * 1440,
    y: frac(i * 3.71 + 2) * 700,
    r: 0.5 + t * 1.4,
    o: 0.3 + frac(i * 5.7) * 0.6,
  };
});

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Bright twilight sky. */}
          <linearGradient id="rn-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8f7fd6" />
            <stop offset="38%" stopColor="#7d6ec6" />
            <stop offset="72%" stopColor="#8a72b4" />
            <stop offset="100%" stopColor="#b491a6" />
          </linearGradient>
          <radialGradient id="rn-violet">
            <stop offset="0%" stopColor="#c9b8ff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#c9b8ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-pink">
            <stop offset="0%" stopColor="#ffc6e6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffc6e6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-blue">
            <stop offset="0%" stopColor="#a9def9" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a9def9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-peach">
            <stop offset="0%" stopColor="#ffd9b8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffd9b8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-moon">
            <stop offset="0%" stopColor="#fffaff" stopOpacity="1" />
            <stop offset="55%" stopColor="#f3e6ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f3e6ff" stopOpacity="0" />
          </radialGradient>

          {/* Bright wispy clouds: fractal noise → near-white lavender tint. */}
          <filter id="rn-clouds" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.007 0.012"
              numOctaves="4"
              seed="11"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.93
                      0 0 0 0 0.88
                      0 0 0 0 1.0
                      0.9 0 0 0 -0.18"
            />
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {/* Warm peachy cloud highlights. */}
          <filter id="rn-clouds2" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011 0.018"
              numOctaves="5"
              seed="29"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 1.0
                      0 0 0 0 0.86
                      0 0 0 0 0.82
                      0.85 0 0 0 -0.3"
            />
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="rn-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>

        <rect width="1440" height="1024" fill="url(#rn-sky)" />

        {/* nebula glows */}
        <g filter="url(#rn-soft)">
          <ellipse cx="180" cy="120" rx="480" ry="360" fill="url(#rn-violet)" />
          <ellipse cx="1340" cy="80" rx="400" ry="320" fill="url(#rn-blue)" />
          <ellipse cx="780" cy="1060" rx="700" ry="400" fill="url(#rn-pink)" />
          <ellipse cx="1180" cy="600" rx="340" ry="300" fill="url(#rn-violet)" />
          <ellipse cx="1240" cy="220" rx="320" ry="240" fill="url(#rn-peach)" />
          <ellipse cx="460" cy="780" rx="380" ry="260" fill="url(#rn-pink)" />
        </g>

        {/* crescent moon (top-right) with glow */}
        <g transform="translate(1252 170)">
          <circle r="100" fill="url(#rn-moon)" />
          <path d="M -6,-48 a48,48 0 1,0 0,96 a60,60 0 0,1 0,-96 z" fill="#fffaff" opacity="0.95" />
        </g>

        {/* layered bright clouds */}
        <rect width="1440" height="1024" fill="#fff" filter="url(#rn-clouds)" opacity="0.6" />
        <rect width="1440" height="1024" fill="#fff" filter="url(#rn-clouds2)" opacity="0.3" />

        {/* stars over the clouds */}
        <g fill="#ffffff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
