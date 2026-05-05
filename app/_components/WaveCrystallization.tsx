"use client";

import { type RefObject, useEffect, useRef } from "react";

// Same palette / line count as the horizontal device diagram so the waves
// feel continuous when the page hands off from the device into the
// crystallization phase.
const PALETTE = [
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#a855f7",
];

// START_YS are derived to make each wave render at the *exact same screen y*
// as the corresponding wave in HorizontalDeviceDiagram at the moment of the
// phase handoff. The device SVG is h-[92vh] inside an items-center section
// (4 vh top inset) plus a translate-y-[5vh] wrapper, so a wave at the
// device-viewBox y `vy_hd` renders at screen y_vh = 9 + vy_hd · 92/600.
// This SVG uses viewBox height 600 height-fitted to the viewport, so
// vy_wc = 6 · y_vh = 54 + vy_hd · 0.92.
//
// Source HD wave y's: 278, 284, 290, 296, 302, 308.
const START_YS = [309.76, 315.28, 320.8, 326.32, 331.84, 337.36];
// At full progress the bands tile the viewport: 6 bands × 100 viewBox units
// per band = 600 viewBox units = full height.
const END_YS = [50, 150, 250, 350, 450, 550];

const VIEWBOX_W = 1500;
const VIEWBOX_H = 600;
const WAVELENGTH = 30;
const BASE_AMP = 3; // matches HorizontalDeviceDiagram's baseline amplitude
const PEAK_AMP = 14;
const END_STROKE = 102; // thick enough that 6 bands cover the full viewBox

function wavePath(
  y: number,
  startX: number,
  endX: number,
  wavelength: number,
  amplitude: number,
) {
  const half = wavelength / 2;
  let d = `M ${startX} ${y}`;
  let x = startX;
  let dir = -1;
  while (x < endX) {
    const cpX = x + half / 2;
    const cpY = y + dir * amplitude * 2;
    const nextX = x + half;
    d += ` Q ${cpX.toFixed(2)} ${cpY.toFixed(2)} ${nextX.toFixed(2)} ${y}`;
    x = nextX;
    dir *= -1;
  }
  return d;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

interface Props {
  // The parent owns the scroll listener and writes the [0, 1] crystallization
  // progress into this ref. We don't take it as state — that would re-render
  // every frame; reading from a ref inside RAF keeps everything imperative.
  progressRef: RefObject<number>;
}

export default function WaveCrystallization({ progressRef }: Props) {
  const motionGroupRef = useRef<SVGGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const offsetRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let rafId: number;
    lastTimeRef.current = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      const p = progressRef.current ?? 0;

      // Phase model (within crystallization progress):
      //   0.00 – 0.05  : continuous from horizontal section (untouched)
      //   0.05 – 0.35  : amplitude grows (waves get more dramatic)
      //   0.40 – 0.70  : amplitude collapses to 0 + motion freezes
      //   0.45 – 0.85  : y-positions spread from clustered to evenly-distributed
      //   0.55 – 0.92  : stroke thickens from 1 → ~100 (lines become bands)
      const motionFactor = 1 - smoothstep(0.4, 0.7, p);
      offsetRef.current =
        (offsetRef.current + 12.5 * motionFactor * dt) % WAVELENGTH;
      if (motionGroupRef.current) {
        motionGroupRef.current.setAttribute(
          "transform",
          `translate(${offsetRef.current.toFixed(2)} 0)`,
        );
      }

      const ampGrow = smoothstep(0.05, 0.35, p);
      const ampCollapse = smoothstep(0.4, 0.7, p);
      const amplitude =
        lerp(BASE_AMP, PEAK_AMP, ampGrow) * (1 - ampCollapse);
      const yPhase = smoothstep(0.45, 0.85, p);
      const strokePhase = smoothstep(0.55, 0.92, p);

      for (let i = 0; i < PALETTE.length; i++) {
        const y = lerp(START_YS[i], END_YS[i], yPhase);
        const sw = lerp(1, END_STROKE, strokePhase);
        const path = pathRefs.current[i];
        if (path) {
          path.setAttribute(
            "d",
            wavePath(y, -50, VIEWBOX_W + 50, WAVELENGTH, amplitude),
          );
          path.setAttribute("stroke-width", sw.toFixed(1));
        }
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [progressRef]);

  return (
    // The parent positions and toggles visibility of this layer. We just fill
    // it edge-to-edge; bg-white is a safety net so when the parent reveals us
    // we never reveal whatever is painted underneath.
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-white">
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g ref={motionGroupRef}>
          {PALETTE.map((color, i) => (
            <path
              key={i}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={wavePath(
                START_YS[i],
                -50,
                VIEWBOX_W + 50,
                WAVELENGTH,
                BASE_AMP,
              )}
              fill="none"
              stroke={color}
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
