/**
 * Surreal, dreamy backdrop — self-contained (no image files required). A bright
 * pastel sky, floating puffy clouds, a steaming coffee cup resting on a cloud,
 * drifting coffee beans, a daytime crescent moon, and twinkling sparkles. Sits
 * behind the whole app; the frosted-glass UI floats on top.
 *
 * Bring your own art: drop a file at `public/bg-sky.jpg` and it replaces the
 * procedural sky while the coffee elements keep floating on top. If the file is
 * absent the procedural sky is used.
 */

const SKY_IMAGE = '/bg-sky.jpg';

const SPARKLES = [
  { x: 360, y: 250, s: 9 },
  { x: 980, y: 180, s: 6 },
  { x: 1320, y: 360, s: 11 },
  { x: 520, y: 520, s: 5 },
  { x: 1150, y: 520, s: 7 },
  { x: 240, y: 560, s: 6 },
  { x: 860, y: 700, s: 8 },
  { x: 1340, y: 760, s: 6 },
  { x: 620, y: 880, s: 7 },
  { x: 120, y: 220, s: 7 },
  { x: 700, y: 360, s: 5 },
  { x: 1080, y: 660, s: 6 },
  { x: 430, y: 700, s: 8 },
  { x: 1260, y: 470, s: 5 },
];

function Puff({ x, y, scale = 1, opacity = 0.9, drift = 'rn-drift' }: { x: number; y: number; scale?: number; opacity?: number; drift?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <g className={drift} filter="url(#rn-puff)">
        <ellipse cx="0" cy="6" rx="120" ry="40" fill="#ffffff" />
        <ellipse cx="-72" cy="14" rx="62" ry="40" fill="#fbf6ff" />
        <ellipse cx="74" cy="16" rx="66" ry="42" fill="#ffffff" />
        <ellipse cx="-26" cy="-20" rx="56" ry="40" fill="#f4ecff" />
        <ellipse cx="38" cy="-16" rx="50" ry="36" fill="#ffffff" />
      </g>
    </g>
  );
}

function Bean({ x, y, rot = 0, scale = 1, opacity = 0.85 }: { x: number; y: number; rot?: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      <ellipse rx="14" ry="9" fill="url(#rn-bean)" />
      <path d="M 0,-8 C 4.5,-3 4.5,3 0,8" stroke="#2a1710" strokeWidth="1.5" fill="none" opacity="0.55" />
      <ellipse cx="-4" cy="-3" rx="3.4" ry="2" fill="#ffffff" opacity="0.25" />
    </g>
  );
}

function CoffeeCup({
  x = 1070,
  y = 768,
  scale = 1,
  opacity = 0.92,
  bob = 'rn-bob',
}: {
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  bob?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <g className={bob}>
        <circle r="150" fill="url(#rn-cupglow)" />
        <Puff x={6} y={70} scale={0.9} opacity={0.95} drift="rn-drift2" />
        {/* steam */}
        <g className="rn-steam" filter="url(#rn-soft2)" opacity="0.6">
          <path d="M -16,-50 C -30,-70 -2,-84 -16,-108" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 14,-50 C 0,-72 28,-86 14,-110" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
        {/* saucer */}
        <ellipse cx="0" cy="60" rx="100" ry="20" fill="url(#rn-porcelain)" />
        <ellipse cx="0" cy="56" rx="100" ry="18" fill="#fbf5ff" opacity="0.5" />
        {/* handle */}
        <path d="M 56,-12 C 100,-18 100,34 62,30" stroke="#e7daf7" strokeWidth="12" fill="none" />
        {/* body */}
        <path d="M -58,-30 C -55,32 -40,48 0,48 C 40,48 55,32 58,-30 Z" fill="url(#rn-cup)" />
        {/* coffee surface + rim */}
        <ellipse cx="0" cy="-30" rx="58" ry="16" fill="#efe3ff" />
        <ellipse cx="0" cy="-30" rx="50" ry="13" fill="url(#rn-coffee)" />
        <ellipse cx="0" cy="-30" rx="58" ry="16" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
      </g>
    </g>
  );
}

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Procedural sky (replaced by the user image when present). */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rn-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b9c4f3" />
            <stop offset="35%" stopColor="#b4a7e8" />
            <stop offset="68%" stopColor="#c8a8d8" />
            <stop offset="100%" stopColor="#f0c6cb" />
          </linearGradient>
          <radialGradient id="rn-sun">
            <stop offset="0%" stopColor="#fff6e6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff6e6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-violet">
            <stop offset="0%" stopColor="#cbbcff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#cbbcff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-pink">
            <stop offset="0%" stopColor="#ffc8e6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffc8e6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-blue">
            <stop offset="0%" stopColor="#abe0fb" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#abe0fb" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rn-moon">
            <stop offset="0%" stopColor="#fffaff" stopOpacity="1" />
            <stop offset="55%" stopColor="#f3e6ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f3e6ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rn-aurora" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="45%" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#f9a8d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="rn-planet" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#fcd9b6" />
            <stop offset="55%" stopColor="#d8a7d8" />
            <stop offset="100%" stopColor="#8d6fc4" />
          </radialGradient>
          <linearGradient id="rn-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#f5e6ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
          </linearGradient>
          <filter id="rn-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
          <filter id="rn-haze" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.014" numOctaves="4" seed="11" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 1  0.8 0 0 0 -0.35" />
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width="1440" height="1024" fill="url(#rn-sky)" />
        <g filter="url(#rn-soft)">
          <ellipse cx="330" cy="40" rx="520" ry="380" fill="url(#rn-sun)" />
          <ellipse cx="170" cy="180" rx="460" ry="340" fill="url(#rn-violet)" />
          <ellipse cx="1340" cy="120" rx="420" ry="320" fill="url(#rn-blue)" />
          <ellipse cx="780" cy="1060" rx="720" ry="420" fill="url(#rn-pink)" />
          <ellipse cx="1180" cy="640" rx="360" ry="320" fill="url(#rn-violet)" />
        </g>
        <rect width="1440" height="1024" fill="#fff" filter="url(#rn-haze)" opacity="0.35" />

        {/* aurora ribbon */}
        <g filter="url(#rn-soft)" opacity="0.55">
          <path d="M -100,360 C 360,220 760,470 1120,300 C 1340,205 1480,300 1560,250 L 1560,430 C 1300,470 1040,360 760,470 C 420,600 120,470 -100,540 Z" fill="url(#rn-aurora)" />
        </g>

        {/* ringed planet */}
        <g transform="translate(995 150) rotate(-18)">
          <ellipse rx="118" ry="24" fill="none" stroke="url(#rn-ring)" strokeWidth="8" opacity="0.75" />
          <circle r="46" fill="url(#rn-planet)" />
          <path d="M -118,6 A 118 24 0 0 0 118,6" fill="none" stroke="url(#rn-ring)" strokeWidth="8" opacity="0.85" />
        </g>

        {/* crescent moon */}
        <g transform="translate(1280 200)">
          <circle r="120" fill="url(#rn-moon)" />
          <path d="M -6,-50 a50,50 0 1,0 0,100 a62,62 0 0,1 0,-100 z" fill="#fffaff" opacity="0.95" />
        </g>
      </svg>

      {/* Optional user-supplied sky art; hides itself if the file is missing. */}
      <img
        src={SKY_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Floating decor (clouds + coffee), always on top of the sky/image. */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rn-cupglow">
            <stop offset="0%" stopColor="#ffe7c2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffe7c2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rn-cup" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef8ff" />
            <stop offset="100%" stopColor="#d8c6f4" />
          </linearGradient>
          <linearGradient id="rn-porcelain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6eeff" />
            <stop offset="100%" stopColor="#cbbcec" />
          </linearGradient>
          <radialGradient id="rn-coffee">
            <stop offset="0%" stopColor="#7d4c2d" />
            <stop offset="100%" stopColor="#3f2415" />
          </radialGradient>
          <radialGradient id="rn-bean" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#7e4d2c" />
            <stop offset="100%" stopColor="#3c2114" />
          </radialGradient>
          <filter id="rn-puff" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="rn-soft2" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* shooting star */}
        <g className="rn-twinkle" style={{ animationDuration: '6s' }} opacity="0.85">
          <path d="M 560,120 L 760,70" stroke="url(#rn-ring)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="760" cy="70" r="4" fill="#ffffff" />
        </g>

        {/* floating puffy clouds */}
        <Puff x={300} y={360} scale={1.15} opacity={0.92} drift="rn-drift" />
        <Puff x={560} y={170} scale={0.7} opacity={0.78} drift="rn-drift2" />
        <Puff x={1130} y={300} scale={0.95} opacity={0.85} drift="rn-drift2" />
        <Puff x={150} y={780} scale={0.95} opacity={0.8} drift="rn-drift" />
        <Puff x={760} y={840} scale={1.5} opacity={0.95} drift="rn-drift" />
        <Puff x={1290} y={730} scale={1.05} opacity={0.85} drift="rn-drift2" />
        <Puff x={70} y={520} scale={0.85} opacity={0.7} drift="rn-drift" />
        <Puff x={980} y={560} scale={1.25} opacity={0.6} drift="rn-drift2" />

        {/* distant floating cup */}
        <CoffeeCup x={188} y={612} scale={0.5} opacity={0.62} bob="rn-bob2" />

        {/* main coffee cup on a cloud */}
        <CoffeeCup />

        {/* floating coffee beans */}
        <g className="rn-bob2">
          <Bean x={1230} y={690} rot={-20} scale={1.1} />
          <Bean x={1300} y={760} rot={28} scale={0.95} />
          <Bean x={1185} y={815} rot={62} scale={1.0} />
        </g>
        <Bean x={360} y={470} rot={-15} scale={0.9} opacity={0.7} />
        <Bean x={1330} y={430} rot={35} scale={0.85} opacity={0.7} />
        <Bean x={470} y={900} rot={10} scale={0.95} opacity={0.7} />
        <Bean x={250} y={300} rot={48} scale={0.8} opacity={0.6} />
        <Bean x={1100} y={470} rot={-32} scale={0.78} opacity={0.6} />

        {/* twinkling sparkles */}
        <g fill="#ffffff">
          {SPARKLES.map((s, i) => (
            <path
              key={i}
              className="rn-twinkle"
              style={{ animationDelay: `${(i % 5) * 0.7}s` }}
              transform={`translate(${s.x} ${s.y}) scale(${s.s})`}
              d="M0,-1 C0.18,-0.28 0.28,-0.18 1,0 C0.28,0.18 0.18,0.28 0,1 C-0.18,0.28 -0.28,0.18 -1,0 C-0.28,-0.18 -0.18,-0.28 0,-1 Z"
              opacity="0.8"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
