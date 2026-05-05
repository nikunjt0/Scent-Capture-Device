import Link from "next/link";

function wavePath(y: number, startX = -150, endX = 1600, wavelength = 30, amplitude = 3) {
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

// Six waves stacked through the polyvent's middle dark-grey band (viewBox y
// ≈ 274–312). They emerge through the GORE membrane and travel right toward
// the chip's sensor array.
const scents = [
  { y: 278, color: PALETTE[0] },
  { y: 284, color: PALETTE[1] },
  { y: 290, color: PALETTE[2] },
  { y: 296, color: PALETTE[3] },
  { y: 302, color: PALETTE[4] },
  { y: 308, color: PALETTE[5] },
];

// Coordinates of the 8 inner white sensor pads in BoschBME690.svg (in the
// chip's own coordinate system). Rendered inside the chip transform so they
// overlay exactly on the matching pads. Each rect is transparent except
// during brief flash windows, preserving the dark sensor markers underneath.
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

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-8">
      <Link
        href="/"
        className="absolute right-4 top-4 z-10 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-sm transition hover:bg-neutral-100"
      >
        ← Back
      </Link>
      <div className="relative w-full max-w-6xl" style={{ aspectRatio: "1580 / 600" }}>
        <svg
          viewBox="-80 0 1580 600"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full"
          style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinecap: "round", strokeLinejoin: "round" }}
        >
          <defs>
            {/* Visibility windows for the scent waves. They disappear inside
                each device and re-emerge downstream:
                  1) before the GORE vent's left wall (x ≤ 88)
                  2) between the GORE membrane (x ≥ 150) and the Sensiron's
                     left tube opening (x ≤ 750)
                  3) past the Sensiron's right tube exit (x ≥ 1023) up to
                     the pump's intake mouth (x ≤ 1100)
                  4) past the pump body (x ≥ 1323) — flows out through the
                     exhaust gap on the right edge of the chamber. */}
            <clipPath id="scent-clip">
              <rect x="-100" y="0" width="188" height="600" />
              <rect x="150" y="0" width="600" height="600" />
              <rect x="1023" y="0" width="77" height="600" />
              <rect x="1323" y="0" width="177" height="600" />
            </clipPath>
          </defs>

          {/* Sealed pneumatic channel — outline rectangle that encloses the
              full pneumatic path. Left edge runs through the GORE PolyVent's
              dark grey center band (viewBox x=140) so it reads as the point
              where the pneumatic tube opens up to the GORE membrane; right
              edge sits a bit past the diaphragm pump (x=1370). A 50-unit
              gap on the right edge (y=268..318) is the exhaust vent through
              which the scent waves leave the chamber after the pump. The
              path is split at the gap and explicitly closes via an L back
              to the start (a Z would close to the last M, not the path
              start, drawing a diagonal across the chamber). */}
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

          {/* GORE PolyVent — left side. The SVG file includes its own
              "GORE PolyVent" label, which sits just above the vent body. */}
          <image
            href="/model/GOREPolyVent.svg"
            x="0"
            y="0"
            width="3508"
            height="4961"
            transform="translate(80 170) scale(0.22) translate(-976 -1361)"
          />

          {/* Bosch BME690 chip — right side. Anchor y=147 puts the chip body
              (native y 1127..2572) vertically centered on the rectangle
              (viewBox y=293). Title baseline lands at viewBox y=147 just
              above the body. */}
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

          {/* Sensiron SFM3019 air-intake flow verifier. Anchored so the tube
              center (native y≈1885) aligns with the scent band's middle
              (viewBox y≈293). Left tube opening lands at viewBox x=750;
              right tube exit at x=1023 — see scent-clip. */}
          <image
            href="/model/SensironSFM3019.svg"
            x="0"
            y="0"
            width="3508"
            height="4961"
            transform="translate(750 208) scale(0.22) translate(-502 -1500)"
          />

          {/* KNF NMP 03 Diaphragm Pump — to the right of the Sensiron. The
              pump's "intake mouth" is the gap between the two horizontal
              black lines on its left side (native y=1166 and y=1473). The
              midpoint (native 590, 1320) is anchored to viewBox (1100, 293)
              so the scent band flows straight into the gap. Body extends to
              viewBox x≈1323. SVG kept as-is — colors and label preserved. */}
          <image
            href="/model/KNFNMP03DiaphragmPump.svg"
            x="0"
            y="0"
            width="3508"
            height="4961"
            transform="translate(1100 293) scale(0.22) translate(-590 -1320)"
          />

          {/* Scent waves — flow left to right over the top, clipped to vanish
              inside each device and re-emerge downstream. After the pump
              they reappear and exit through the chamber's exhaust gap. */}
          <g clipPath="url(#scent-clip)">
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
      </div>
    </div>
  );
}
