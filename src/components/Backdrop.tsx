/**
 * Self-contained celestial backdrop: a deep-sky gradient, soft nebula glows,
 * procedurally generated wispy clouds (SVG fractal-noise turbulence — no image
 * files), and a crescent moon. Sits behind the whole app; the glass UI floats
 * on top. Purely decorative.
 */
// Deterministic scattered stars (fixed seed so they don't jump between renders).
const STARS = Array.from({ length: 80 }, (_, i) => {
  const frac = (n: number) => {
    const v = Math.sin(n) * 43758.5453;
    return v - Math.floor(v);
  };
  const t = frac(i * 12.9898);
  return {
    x: frac(i * 7.13 + 1) * 1440,
    y: frac(i * 3.71 + 2) * 1024,
    r: 0.5 + t * 1.5,
    o: 0.25 + frac(i * 5.7) * 0.65,
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
          <radialGradient id="rn-sky" cx="50%" cy="-5%" r="130%">
            <stop offset="0%" stopColor="#2a1d57" />
            <stop offset="42%" stopColor="#180f3a" />
            <stop offset="100%" stopColor="#09061a" />
          </radialGradient>
          <radialGradient id="rn-violet">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-pink">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-blue">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-moon">
            <stop offset="0%" stopColor="#fff7fb" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#e9d5ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
          </radialGradient>

          {/* Wispy clouds: fractal noise → tinted, noise-driven alpha → softened. */}
          <filter id="rn-clouds" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.013"
              numOctaves="4"
              seed="11"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.78
                      0 0 0 0 0.66
                      0 0 0 0 0.99
                      0.95 0 0 0 -0.32"
            />
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="rn-clouds2" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="5"
              seed="29"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.95
                      0 0 0 0 0.72
                      0 0 0 0 0.86
                      0.9 0 0 0 -0.4"
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
          <ellipse cx="180" cy="110" rx="460" ry="340" fill="url(#rn-violet)" />
          <ellipse cx="1340" cy="70" rx="380" ry="300" fill="url(#rn-blue)" />
          <ellipse cx="780" cy="1080" rx="680" ry="380" fill="url(#rn-pink)" />
          <ellipse cx="1180" cy="600" rx="320" ry="280" fill="url(#rn-violet)" />
          <ellipse cx="520" cy="760" rx="360" ry="240" fill="url(#rn-pink)" />
        </g>

        {/* crescent moon (top-right) with glow */}
        <g transform="translate(1248 168)">
          <circle r="92" fill="url(#rn-moon)" />
          <path d="M -6,-46 a46,46 0 1,0 0,92 a58,58 0 0,1 0,-92 z" fill="#fbf3ff" opacity="0.92" />
        </g>

        {/* layered wispy clouds */}
        <rect width="1440" height="1024" fill="#fff" filter="url(#rn-clouds)" opacity="0.42" />
        <rect width="1440" height="1024" fill="#fff" filter="url(#rn-clouds2)" opacity="0.22" />

        {/* stars, scattered over the clouds */}
        <g fill="#ffffff">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
