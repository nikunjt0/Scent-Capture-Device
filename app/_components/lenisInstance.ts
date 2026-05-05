import type Lenis from "lenis";

// Minimal singleton so non-Smooth-Scroll components (e.g. anchor buttons in
// page.tsx) can drive the same Lenis instance that's smoothing the page,
// without dragging in a Context provider.
let _lenis: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  _lenis = lenis;
}

export function getLenis(): Lenis | null {
  return _lenis;
}
