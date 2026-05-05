"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLenis } from "./lenisInstance";

// Lenis persists across client-side navigations (it lives in the root
// layout). Without an explicit reset, navigating from a deeply-scrolled
// page carries the old scroll position to the new page.
//
// We skip the root path ("/") entirely because the landing page manages
// its own scroll position — it either starts fresh (naturally at 0) or
// arrives via the #choose deep-link (handled in page.tsx).
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
