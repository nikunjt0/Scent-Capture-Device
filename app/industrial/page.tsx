"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import StlViewer from "../_components/StlViewer";

const SELLING_POINTS = [
  {
    label: "01",
    heading: "Quality Control",
    body: "Detect batch-to-batch scent drift in real time. Whether you're producing fragrances, foods, or chemicals, Scentia captures a fingerprint of every batch and flags deviations before they ship — replacing subjective sniff tests with measurable data.",
  },
  {
    label: "02",
    heading: "Spoilage Detection",
    body: "Catch contamination and spoilage the moment it begins. The sensor picks up volatile compounds released by degrading food, pharmaceuticals, or raw materials at parts-per-billion sensitivity — hours or days before a human nose would notice.",
  },
  {
    label: "03",
    heading: "Compliance & Auditing",
    body: "Build a timestamped scent library for every product line. Compare today's capture against a certified reference fingerprint to prove regulatory compliance — no lab required, results in seconds.",
  },
  {
    label: "04",
    heading: "Leak & Emission Monitoring",
    body: "Deploy across a facility to continuously sniff for chemical leaks, gas emissions, or air-quality anomalies. Each unit syncs wirelessly, building a real-time spatial map of airborne compounds across your plant floor.",
  },
  {
    label: "05",
    heading: "Consistency at Scale",
    body: "Track scent consistency across production sites, suppliers, and seasons. Scentia's 80-channel fingerprint captures subtle variations invisible to the human nose, so you can hold every unit to the same standard — wherever it's made.",
  },
  {
    label: "06",
    heading: "Rapid Cataloguing",
    body: "Capture, label, and store scent profiles in under 10 seconds. Build a searchable library of raw materials, finished goods, or environmental baselines that your team can reference, compare, and analyze from anywhere.",
  },
  {
    label: "07",
    heading: "Fleet-Ready Hardware",
    body: "Credit-card sized, wirelessly connected, and under $300 per unit. Deploy tens or hundreds across your operation without breaking the budget — every device self-corrects for temperature, humidity, and pressure so readings stay comparable.",
  },
];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function IndustrialPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const modelWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const title = titleRef.current;
      const modelWrap = modelWrapRef.current;
      if (!title || !modelWrap) return;
      const winH = window.innerHeight;
      const t = smoothstep(0, winH * 0.8, window.scrollY);
      title.style.opacity = `${(1 - t).toFixed(3)}`;
      title.style.transform = `translate(-50%, -50%) translateY(${(-30 * t).toFixed(1)}px)`;
      // Model slides from right of title (translateX +95%) to pinned left (0%).
      modelWrap.style.transform = `translateX(${(95 * (1 - t)).toFixed(2)}%)`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Link
        href="/#choose"
        className="fixed left-6 top-6 z-30 font-die-grotesk text-sm tracking-tight text-white/70 transition-colors hover:text-white"
      >
        ← Back
      </Link>

      <div
        ref={modelWrapRef}
        className="fixed inset-y-0 left-0 z-0 w-1/2"
        style={{ willChange: "transform", transform: "translateX(95%)" }}
      >
        <StlViewer
          stlPath="/industrial.stl"
          scale={2}
          initialRotation={[0.08, 0, 0]}
        />
      </div>

      <h1
        ref={titleRef}
        className="pointer-events-none fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 font-die-grotesk text-[10vw] leading-none tracking-tight"
      >
        Industrial
      </h1>

      <div className="relative z-10 ml-auto w-1/2">
        <div className="min-h-screen" />
        <div className="space-y-[40vh] px-10 pb-[30vh] pr-16">
          {SELLING_POINTS.map((point) => (
            <div key={point.label}>
              <span className="font-mono text-xs tracking-[0.3em] text-white/40">
                {point.label}
              </span>
              <h2 className="mt-3 font-die-grotesk text-3xl leading-tight tracking-tight md:text-4xl">
                {point.heading}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — full-width image with inverted Scentia logo. */}
      <footer className="relative z-10 w-full">
        <img
          src="/industrialfooter.png"
          alt="Industrial application"
          className="block w-full object-cover"
        />
        <div className="absolute bottom-6 right-8">
          <svg
            className="w-36"
            aria-label="Scentia logo"
            viewBox="0 0 501.72 117.46"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <text
                transform="translate(68.75 93.56)"
                fill="#ffffff"
                fontFamily="'Avenir Next', 'Segoe UI', sans-serif"
                fontSize="108.16"
                fontWeight="600"
                letterSpacing="-0.03em"
              >
                <tspan x="0" y="0">S</tspan>
                <tspan dx="-4.5">CENTIA</tspan>
              </text>
              <rect fill="#ffffff" y="16.39" width="62.5" height="81.17" />
              <polygon fill="#000000" points="31.25 91.31 43.75 66.31 56.25 91.31 31.25 91.31" />
            </g>
          </svg>
        </div>
      </footer>
    </div>
  );
}
