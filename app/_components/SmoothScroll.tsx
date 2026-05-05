"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "./lenisInstance";

// The page is laid out vertically. The "horizontal" device section uses a
// pinned (sticky) container whose inner content is translated horizontally
// based on vertical scroll progress — so wheel-down still moves the device
// sideways, but the page itself is a normal vertical scroll. That's what lets
// us continue into a separate vertical section after the device.
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4,
    });
    setLenis(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
