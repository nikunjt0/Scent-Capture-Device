"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ComponentDescriptions from "./_components/ComponentDescriptions";
import HorizontalDeviceDiagram from "./_components/HorizontalDeviceDiagram";
import { getLenis } from "./_components/lenisInstance";
import WaveCrystallization from "./_components/WaveCrystallization";

function Logo() {
  return (
    <svg
      className="logo-svg"
      aria-label="Scentia logo"
      viewBox="0 0 501.72 117.46"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <text className="logo-wordmark" transform="translate(68.75 93.56)">
          <tspan x="0" y="0">
            S
          </tspan>
          <tspan dx="-4.5">CENTIA</tspan>
        </text>
        <rect className="logo-block" y="16.39" width="62.5" height="81.17" />
        <polygon
          className="logo-triangle"
          points="31.25 91.31 43.75 66.31 56.25 91.31 31.25 91.31"
        />
      </g>
    </svg>
  );
}

// One pinned section drives all three phases off the same vertical scroll:
//   phase 1 — vertical scroll translates the device sideways (innerW − winW)
//   phase 2 — vertical scroll drives the wave crystallization (PHASE2_VH * winH)
//   phase 3 — two black/white panes wipe in from the screen edges, splitting
//             the rainbow into Industrial / Personal buttons (PHASE3_VH * winH)
// Putting them all inside one sticky container means there's only ever one
// wave system on screen — at each phase boundary the previous layer is
// hidden and the next is revealed.
const PHASE2_VH = 3.5; // viewport heights of scroll for the crystallization
const PHASE3_VH = 1.5; // viewport heights of scroll for the split reveal

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function HomePage() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const deviceLayerRef = useRef<HTMLDivElement>(null);
  const crystalLayerRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLButtonElement>(null);
  const rightPaneRef = useRef<HTMLButtonElement>(null);
  const crystalProgressRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    function size() {
      const inner = innerRef.current;
      const section = sectionRef.current;
      if (!inner || !section) return;
      const innerW = inner.scrollWidth;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const phase1Dist = Math.max(0, innerW - winW);
      const phase2Dist = PHASE2_VH * winH;
      const phase3Dist = PHASE3_VH * winH;
      // One viewport for the pinning + horizontal travel + crystallization
      // travel + split reveal travel.
      section.style.height = `${phase1Dist + phase2Dist + phase3Dist + winH}px`;
    }

    function update() {
      const section = sectionRef.current;
      const inner = innerRef.current;
      const deviceLayer = deviceLayerRef.current;
      const crystalLayer = crystalLayerRef.current;
      const leftPane = leftPaneRef.current;
      const rightPane = rightPaneRef.current;
      if (
        !section ||
        !inner ||
        !deviceLayer ||
        !crystalLayer ||
        !leftPane ||
        !rightPane
      )
        return;

      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const innerW = inner.scrollWidth;
      const phase1Dist = Math.max(0, innerW - winW);
      const phase2Dist = PHASE2_VH * winH;
      const phase3Dist = PHASE3_VH * winH;

      const scrolled = -section.getBoundingClientRect().top;

      let p1: number;
      let p2: number;
      let p3: number;
      if (scrolled <= phase1Dist) {
        p1 = phase1Dist > 0 ? Math.max(0, scrolled) / phase1Dist : 0;
        p2 = 0;
        p3 = 0;
      } else if (scrolled <= phase1Dist + phase2Dist) {
        p1 = 1;
        p2 = Math.min(1, (scrolled - phase1Dist) / Math.max(1, phase2Dist));
        p3 = 0;
      } else {
        p1 = 1;
        p2 = 1;
        p3 = Math.min(
          1,
          (scrolled - phase1Dist - phase2Dist) / Math.max(1, phase3Dist),
        );
      }

      inner.style.transform = `translate3d(${(-p1 * phase1Dist).toFixed(2)}px, 0, 0)`;
      crystalProgressRef.current = p2;

      // Phase 1 → 2 boundary: invisible swap from device's wave to the
      // crystallization layer (matching y, wavelength, amplitude, motion).
      if (p2 > 0) {
        deviceLayer.style.visibility = "hidden";
        crystalLayer.style.visibility = "visible";
      } else {
        deviceLayer.style.visibility = "visible";
        crystalLayer.style.visibility = "hidden";
      }

      // Phase 3 — panes wipe in from the screen edges over the first ~85%
      // of phase 3, eased so they decelerate as they meet in the middle.
      const slide = smoothstep(0, 0.85, p3);
      leftPane.style.transform = `translate3d(${(-100 * (1 - slide)).toFixed(2)}%, 0, 0)`;
      rightPane.style.transform = `translate3d(${(100 * (1 - slide)).toFixed(2)}%, 0, 0)`;
      // Don't let an off-screen pane swallow clicks until it's mostly in
      // view — otherwise a stray click during phase 1 / 2 could fire.
      const panesActive = p3 > 0.6;
      leftPane.style.pointerEvents = panesActive ? "auto" : "none";
      rightPane.style.pointerEvents = panesActive ? "auto" : "none";
    }

    size();
    update();

    const ro = new ResizeObserver(() => {
      size();
      update();
    });
    if (innerRef.current) ro.observe(innerRef.current);

    function onResize() {
      size();
      update();
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // When arriving from /industrial or /personal via ← Back (#choose),
  // jump straight to the phase-3 scroll position so the two panes are
  // fully visible. We retry a few frames because the SVG needs to render
  // before scrollWidth is accurate.
  useEffect(() => {
    if (window.location.hash !== "#choose") return;

    let attempts = 0;
    function jump() {
      const inner = innerRef.current;
      if (!inner) {
        if (attempts++ < 10) requestAnimationFrame(jump);
        return;
      }
      const innerW = inner.scrollWidth;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const phase1Dist = Math.max(0, innerW - winW);
      const phase2Dist = PHASE2_VH * winH;
      const phase3Dist = PHASE3_VH * winH;
      const target = phase1Dist + phase2Dist + phase3Dist;

      // Force both Lenis AND native scroll to the target.
      const lenis = getLenis();
      if (lenis) {
        lenis.stop();
        lenis.scrollTo(target, { immediate: true, force: true });
        lenis.start();
      }
      window.scrollTo(0, target);
      history.replaceState(null, "", "/");
    }
    requestAnimationFrame(jump);
  }, []);

  return (
    <main className="relative bg-white">
      {/* Header is absolute (not fixed) so the logo stays anchored to the
          document top and scrolls up out of view as the user begins moving
          through the diagram. */}
      <header className="absolute inset-x-0 top-0 z-30 flex w-screen items-start justify-between p-6">
        <Logo />
        <Link
          href="/spec"
          className="mt-3 font-die-grotesk text-sm tracking-[0.2em] text-black/55 transition-colors hover:text-black"
        >
          DETAILED TECH SPEC →
        </Link>
      </header>

      <section ref={sectionRef} className="relative">
        <div className="sticky top-0 h-screen w-screen overflow-hidden bg-white">
          {/* Device layer: in flow, translateX driven by phase 1 progress. */}
          <div ref={deviceLayerRef} className="relative h-full w-full">
            <div
              ref={innerRef}
              className="flex h-screen items-center"
              style={{ width: "max-content", willChange: "transform" }}
            >
              <div className="relative translate-y-[5vh]">
                <HorizontalDeviceDiagram />
                <ComponentDescriptions />
              </div>
            </div>
          </div>

          {/* Crystallization layer: absolutely overlaid, hidden during
              phase 1, revealed at the phase-1 → phase-2 boundary. Driven by
              phase 2 progress via crystalProgressRef. */}
          <div
            ref={crystalLayerRef}
            className="absolute inset-0"
            style={{ visibility: "hidden" }}
          >
            <WaveCrystallization progressRef={crystalProgressRef} />
          </div>

          {/* Phase 3 — split-pane buttons. Always in the DOM but parked
              off-screen via translateX(±100%); they wipe inward as the user
              scrolls past the crystallization. The two-button layout itself
              is the affordance, so the entire half-screen pane is the
              <button>'s click target. */}
          <button
            ref={leftPaneRef}
            type="button"
            onClick={() => router.push("/industrial")}
            className="group absolute inset-y-0 left-0 z-20 flex w-1/2 cursor-pointer items-center justify-center bg-black text-white"
            style={{
              transform: "translate3d(-100%, 0, 0)",
              pointerEvents: "none",
            }}
          >
            <span className="font-die-grotesk text-[6vw] leading-none tracking-tight transition-transform duration-300 group-hover:-translate-y-1">
              Industrial
            </span>
          </button>
          <button
            ref={rightPaneRef}
            type="button"
            onClick={() => router.push("/personal")}
            className="group absolute inset-y-0 right-0 z-20 flex w-1/2 cursor-pointer items-center justify-center bg-white text-black"
            style={{
              transform: "translate3d(100%, 0, 0)",
              pointerEvents: "none",
            }}
          >
            <span className="font-die-grotesk text-[6vw] leading-none tracking-tight transition-transform duration-300 group-hover:-translate-y-1">
              Personal
            </span>
          </button>
        </div>
      </section>

    </main>
  );
}
