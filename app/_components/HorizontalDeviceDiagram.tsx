// Horizontal version of the device diagram for the landing page. The viewBox
// is extended leftward so the leftmost portion of the SVG is empty space the
// scent waves flow through — this is what's visible "above the fold" before
// the user starts horizontal-scrolling into the device.

// startX is intentionally well to the left of the viewBox left edge (-1500)
// and endX well to the right of the viewBox right edge (3000) so that as the
// wave is translated right by one wavelength (30), there's always wave
// content covering both visible edges — no gap creeps in on either side.
function wavePath(y: number, startX = -1800, endX = 3200, wavelength = 30, amplitude = 3) {
  const half = wavelength / 2;
  let d = `M ${startX} ${y}`;
  let x = startX;
  let dir = -1;
  while (x < endX) {
    const cpX = x + half / 2;
    const cpY = y + dir * amplitude * 2;
    const nextX = x + half;
    d += ` Q ${cpX} ${cpY} ${nextX} ${y}`;
    x = nextX;
    dir *= -1;
  }
  return d;
}

const SCENT_DUR = "2.4";
const PALETTE = ["#ec4899", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#a855f7"];

const scents = [
  { y: 278, color: PALETTE[0] },
  { y: 284, color: PALETTE[1] },
  { y: 290, color: PALETTE[2] },
  { y: 296, color: PALETTE[3] },
  { y: 302, color: PALETTE[4] },
  { y: 308, color: PALETTE[5] },
];

const SENSOR_SIZE = 147;
const SENSOR_FLASH_DUR = "12s";
const sensorWhites = [
  { id: 111, x: 2633, y: 1443, flashes: [{ at: 0.10, c: PALETTE[0] }, { at: 0.50, c: PALETTE[3] }, { at: 0.80, c: PALETTE[4] }] },
  { id: 112, x: 2225, y: 1441, flashes: [{ at: 0.20, c: PALETTE[1] }, { at: 0.60, c: PALETTE[5] }, { at: 0.92, c: PALETTE[2] }] },
  { id: 113, x: 1815, y: 1439, flashes: [{ at: 0.30, c: PALETTE[2] }, { at: 0.70, c: PALETTE[0] }, { at: 0.05, c: PALETTE[4] }] },
  { id: 114, x: 2633, y: 1790, flashes: [{ at: 0.05, c: PALETTE[3] }, { at: 0.45, c: PALETTE[1] }, { at: 0.78, c: PALETTE[5] }] },
  { id: 115, x: 2221, y: 1788, flashes: [{ at: 0.15, c: PALETTE[4] }, { at: 0.55, c: PALETTE[3] }, { at: 0.88, c: PALETTE[2] }] },
  { id: 116, x: 1815, y: 1788, flashes: [{ at: 0.25, c: PALETTE[5] }, { at: 0.65, c: PALETTE[0] }, { at: 0.95, c: PALETTE[1] }] },
  { id: 117, x: 2636, y: 2130, flashes: [{ at: 0.35, c: PALETTE[0] }, { at: 0.75, c: PALETTE[3] }, { at: 0.08, c: PALETTE[4] }] },
  { id: 118, x: 2224, y: 2128, flashes: [{ at: 0.40, c: PALETTE[3] }, { at: 0.85, c: PALETTE[5] }, { at: 0.18, c: PALETTE[1] }] },
];

// Bouncing-particle region. Computed from the BoschBME690.svg board outline
//   path d="M1621,1127 l0,1444 l1318,1 l0,-1445 l-1318,0 Z"
// mapped through the chip's transform translate(385 147) scale(0.19)
// translate(-1621 -1078):
//   x_outer = (nx - 1621) * 0.19 + 385
//   y_outer = (ny - 1078) * 0.19 + 147
// Board outer bounds: x ∈ [385, 635.42], y ∈ [156.31, 430.86].
// A small inset keeps particles fully inside the visible board.
const CHIP_BOARD = { left: 385, right: 635, top: 156, bottom: 431 };
const CHIP_BOX = { left: 393, right: 627, top: 164, bottom: 423 };
const PARTICLE_R = 3;

// Each particle has a finite-lifetime journey:
//   1. Spawn on the LEFT edge at its color's wave y (breaks off the wave)
//   2. Bounce around inside CHIP_BOX (billiard physics)
//   3. Smoothly transit to the RIGHT edge at its color's wave y (rejoins)
// At loop end the particle teleports back to the entry point and starts
// over. Many particles per color are phase-staggered so the box always has
// a continuous flow of particles, and the teleport is hidden because the
// entry and exit positions both sit on the wave line of the same color.
const STREAM_DURATION = 6; // seconds per full enter→bounce→exit cycle
const STREAMS_PER_COLOR = 14; // particles per color, evenly phase-spread
const STREAM_STEPS = 200;
const STREAM_BOUNCE_RATIO = 0.78; // first 78% bouncing, last 22% exiting

// Wave y positions matching the `scents` array below. Particles enter and
// exit on these lines so they appear to fuse with the corresponding wave.
const WAVE_YS = [278, 284, 290, 296, 302, 308];

function streamTrajectory(
  enterY: number,
  exitY: number,
  initVx: number,
  initVy: number,
  totalT: number,
  steps: number,
) {
  const bounceSteps = Math.floor(steps * STREAM_BOUNCE_RATIO);
  const exitSteps = steps - bounceSteps;

  const xs: number[] = [CHIP_BOARD.left];
  const ys: number[] = [enterY];
  const ts: number[] = [0];

  let x = CHIP_BOARD.left;
  let y = enterY;
  let vx = initVx;
  let vy = initVy;
  const stepT = totalT / steps;

  for (let i = 1; i <= bounceSteps; i++) {
    let remaining = stepT;
    while (remaining > 1e-6) {
      const tRight = vx > 0 ? (CHIP_BOX.right - x) / vx : Infinity;
      const tLeft = vx < 0 ? (CHIP_BOX.left - x) / vx : Infinity;
      const tBottom = vy > 0 ? (CHIP_BOX.bottom - y) / vy : Infinity;
      const tTop = vy < 0 ? (CHIP_BOX.top - y) / vy : Infinity;
      const tWallX = Math.min(tRight, tLeft);
      const tWallY = Math.min(tBottom, tTop);
      const tWall = Math.min(tWallX, tWallY);
      if (tWall >= remaining) {
        x += vx * remaining;
        y += vy * remaining;
        remaining = 0;
      } else {
        x += vx * tWall;
        y += vy * tWall;
        if (tWallX < tWallY) vx = -vx;
        else vy = -vy;
        remaining -= tWall;
      }
    }
    xs.push(x);
    ys.push(y);
    ts.push(i / steps);
  }

  // Smoothly interpolate from the last bounce position to (right edge,
  // exitY) using a cubic smoothstep so the exit feels like a glide rather
  // than a sudden veer.
  const startX = x;
  const startY = y;
  const endX = CHIP_BOARD.right;
  const endY = exitY;
  for (let i = 1; i <= exitSteps; i++) {
    const t = i / exitSteps;
    const ease = t * t * (3 - 2 * t);
    xs.push(startX + (endX - startX) * ease);
    ys.push(startY + (endY - startY) * ease);
    ts.push((bounceSteps + i) / steps);
  }

  return {
    cxValues: xs.map((v) => v.toFixed(2)).join(";"),
    cyValues: ys.map((v) => v.toFixed(2)).join(";"),
    keyTimes: ts.map((v) => v.toFixed(4)).join(";"),
  };
}

// Deterministic PRNG so trajectories are stable across renders.
let _seed = 1337;
function rand() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}

const particles = (() => {
  const out: {
    c: string;
    enterY: number;
    cxValues: string;
    cyValues: string;
    keyTimes: string;
    begin: string;
  }[] = [];
  for (let colorIdx = 0; colorIdx < WAVE_YS.length; colorIdx++) {
    const c = PALETTE[colorIdx];
    const waveY = WAVE_YS[colorIdx];
    for (let p = 0; p < STREAMS_PER_COLOR; p++) {
      // Always entering rightward (vx > 0); vertical velocity varies.
      const initVx = 70 + rand() * 60;
      const initVy = (rand() - 0.5) * 140;
      const phaseOffset = (p / STREAMS_PER_COLOR) * STREAM_DURATION;
      out.push({
        c,
        enterY: waveY,
        ...streamTrajectory(waveY, waveY, initVx, initVy, STREAM_DURATION, STREAM_STEPS),
        begin: `-${phaseOffset.toFixed(2)}s`,
      });
    }
  }
  return out;
})();

function flashAnim(flashes: { at: number; c: string }[]) {
  const sorted = [...flashes].sort((a, b) => a.at - b.at);
  const kt: string[] = ["0"];
  const op: string[] = ["0"];
  const fl: string[] = [sorted[0]?.c ?? PALETTE[0]];
  for (const f of sorted) {
    kt.push((f.at - 0.005).toFixed(4));
    op.push("0");
    fl.push(f.c);
    kt.push(f.at.toFixed(4));
    op.push("0.7");
    fl.push(f.c);
    kt.push((f.at + 0.012).toFixed(4));
    op.push("0.7");
    fl.push(f.c);
    kt.push((f.at + 0.04).toFixed(4));
    op.push("0");
    fl.push(f.c);
  }
  kt.push("1");
  op.push("0");
  fl.push(sorted[sorted.length - 1]?.c ?? PALETTE[0]);
  return { keyTimes: kt.join(";"), opacity: op.join(";"), fill: fl.join(";") };
}

export default function HorizontalDeviceDiagram() {
  return (
    <svg
      // Original device area was x: -80 → 1500. We extend leftward to x: -1500
      // (~1420 units of empty wave space before the device — what's visible
      // before the user starts horizontal-scrolling) and rightward to
      // x: +3000 (~1500 units of empty wave space after the device, so the
      // user can keep scrolling past the pump exhaust into pure wave).
      viewBox="-1500 0 4500 600"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-[92vh] w-auto"
      preserveAspectRatio="xMinYMid meet"
      style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinecap: "round", strokeLinejoin: "round" }}
    >
      <defs>
        <clipPath id="scent-clip-h">
          {/* First rect extended leftward to match the wavePath buffer so
              waves are visible across the entire empty area on the left. */}
          <rect x="-1800" y="0" width="1888" height="600" />
          {/* Original middle window (x=150..750) split around the chip board
              (x=385..635, computed exactly from the BoschBME690 board path)
              so the wave terminates at the chip's left edge and re-emerges
              at the chip's right edge — particles take over inside. */}
          <rect x="150" y="0" width="235" height="600" />
          <rect x="635" y="0" width="115" height="600" />
          <rect x="1023" y="0" width="77" height="600" />
          {/* Final rect extended rightward to match the wavePath buffer so
              the wave is visible all the way through the new right-side
              empty-scroll area (viewBox max-x = 3000). */}
          <rect x="1323" y="0" width="1707" height="600" />
        </clipPath>
      </defs>

      <path
        d="M 97 98 L 1370 98 L 1370 268 M 1370 318 L 1370 488 L 97 488 L 97 98"
        fill="none"
        stroke="#000"
        strokeWidth={1.5}
      />
      <text
        x="755"
        y="78"
        textAnchor="middle"
        fontFamily="'Courier New', 'CourierNewPSMT', monospace"
        fontSize={18}
        fill="#000"
      >
        Sealed Pneumatic Channel
      </text>
      <text
        x="78"
        y="263"
        textAnchor="end"
        fontFamily="'Courier New', 'CourierNewPSMT', monospace"
        fontSize={12}
        fill="#000"
      >
        Ambient Air Intake
      </text>
      <text
        x="1380"
        y="263"
        textAnchor="start"
        fontFamily="'Courier New', 'CourierNewPSMT', monospace"
        fontSize={12}
        fill="#000"
      >
        Exhaust Vent
      </text>

      <image
        href="/model/GOREPolyVent.svg"
        x="0"
        y="0"
        width="3508"
        height="4961"
        transform="translate(80 170) scale(0.22) translate(-976 -1361)"
      />

      <g transform="translate(385 147) scale(0.19) translate(-1621 -1078)">
        <image
          href="/model/BoschBME690.svg"
          x="0"
          y="0"
          width="3508"
          height="4961"
        />
        {sensorWhites.map((s) => {
          const a = flashAnim(s.flashes);
          return (
            <rect
              key={s.id}
              x={s.x}
              y={s.y}
              width={SENSOR_SIZE}
              height={SENSOR_SIZE}
              fill={s.flashes[0].c}
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values={a.opacity}
                keyTimes={a.keyTimes}
                dur={SENSOR_FLASH_DUR}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill"
                values={a.fill}
                keyTimes={a.keyTimes}
                dur={SENSOR_FLASH_DUR}
                calcMode="discrete"
                repeatCount="indefinite"
              />
            </rect>
          );
        })}
      </g>

      {/* Scent particles — each particle breaks off the wave on the LEFT,
          bounces inside the chip board, then merges back into the wave on
          the RIGHT. The opacity animation fades each particle in at the
          spawn moment and out as it merges, so the per-cycle teleport
          back to the entry point is never visible. */}
      <g>
        {particles.map((p, i) => (
          <circle
            key={`particle-${i}`}
            cx={CHIP_BOARD.left}
            cy={p.enterY}
            r={PARTICLE_R}
            fill={p.c}
            opacity={0}
          >
            <animate
              attributeName="cx"
              values={p.cxValues}
              keyTimes={p.keyTimes}
              dur={`${STREAM_DURATION}s`}
              begin={p.begin}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={p.cyValues}
              keyTimes={p.keyTimes}
              dur={`${STREAM_DURATION}s`}
              begin={p.begin}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.95;0.95;0"
              keyTimes="0;0.06;0.92;1"
              dur={`${STREAM_DURATION}s`}
              begin={p.begin}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      <image
        href="/model/SensironSFM3019.svg"
        x="0"
        y="0"
        width="3508"
        height="4961"
        transform="translate(750 208) scale(0.22) translate(-502 -1500)"
      />

      <image
        href="/model/KNFNMP03DiaphragmPump.svg"
        x="0"
        y="0"
        width="3508"
        height="4961"
        transform="translate(1100 293) scale(0.22) translate(-590 -1320)"
      />

      <g clipPath="url(#scent-clip-h)">
        {scents.map((s) => (
          <g key={s.y}>
            <path
              d={wavePath(s.y)}
              fill="none"
              stroke={s.color}
              strokeWidth={1}
              strokeLinecap="round"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="30 0"
              dur={`${SCENT_DUR}s`}
              begin="0s"
              repeatCount="indefinite"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
