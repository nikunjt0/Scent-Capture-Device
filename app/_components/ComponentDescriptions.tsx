"use client";

import { useEffect, useRef } from "react";

// Must match HorizontalDeviceDiagram's viewBox.
const VIEWBOX_MIN_X = -1500;
const VIEWBOX_WIDTH = 4500;

type ComponentInfo = {
  name: string;
  // viewBox x of the component's visual center (used to position the
  // description horizontally in the wrapper).
  viewBoxX: number;
  description: string;
};

// Descriptions distilled from docs/Scent_Capture_Tech_Specs_BME688 (1).pdf
// — kept short so they don't crowd the diagram.
const COMPONENTS: ComponentInfo[] = [
  {
    name: "GORE PolyVent Snap-In",
    viewBoxX: 80,
    description:
      "Passive ePTFE intake membrane (~17 mm OD). Lets ambient air into the sealed channel while blocking dust and liquid water — no electronics.",
  },
  {
    name: "Bosch BME690 8× Shuttle Board",
    viewBoxX: 510,
    description:
      "Eight MEMS metal-oxide gas sensors on a 40 × 30 mm PCB. Each one cycles a 10-step heater profile, producing up to 80 virtual channels of fingerprint data per capture.",
  },
  {
    name: "Sensirion SFM3019",
    viewBoxX: 887,
    description:
      "Inline mass-flow verifier. Confirms every capture pulled the same volume of air across the sensors — what makes scent fingerprints comparable across days and devices.",
  },
  {
    name: "KNF NMP 03 Diaphragm Pump",
    viewBoxX: 1212,
    description:
      "Compact diaphragm pump (~0.33 L/min, 600 mbar vacuum). Pulls — never pushes — air through the chamber so pump-side outgassing can never reach the sensor array.",
  },
];

// Tuning for the centering effect. The "full opacity" window is intentionally
// narrow so a description only appears once its component is genuinely
// centered under the user's eye, not while it's still drifting in from the
// side.
const FULL_WINDOW_PX = 60; // distance from viewport center where opacity = 1
const FADE_RANGE_PX = 180; // additional distance over which it fades to 0

export default function ComponentDescriptions() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function update() {
      const center = window.innerWidth / 2;
      for (const el of refs.current) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const elCenter = (rect.left + rect.right) / 2;
        const distance = Math.abs(elCenter - center);
        const opacity = Math.max(
          0,
          Math.min(1, 1 - (distance - FULL_WINDOW_PX) / FADE_RANGE_PX),
        );
        el.style.opacity = opacity.toString();
        // Small upward translation as the description fades in.
        el.style.transform = `translate(-50%, ${(1 - opacity) * 14}px)`;
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      {COMPONENTS.map((c, i) => {
        const leftPct = ((c.viewBoxX - VIEWBOX_MIN_X) / VIEWBOX_WIDTH) * 100;
        return (
          <div
            key={c.name}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="pointer-events-none absolute w-[320px] text-center"
            style={{
              left: `${leftPct}%`,
              top: "84%",
              transform: "translate(-50%, 14px)",
              opacity: 0,
            }}
          >
            <h3 className="font-mono text-sm font-semibold tracking-tight text-black">
              {c.name}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-black/70">
              {c.description}
            </p>
          </div>
        );
      })}
    </>
  );
}
