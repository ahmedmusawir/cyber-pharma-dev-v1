"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SpinnerLarge from "@/components/common/SpinnerLarge";
import { useNavSpinner } from "@/store/useNavSpinner";

// The mock services resolve instantly, so without a floor the spinner would flash
// for a single frame. Keep it up for at least MIN_DISPLAY_MS once shown.
const MIN_DISPLAY_MS = 400;
// Hard safety: never let the overlay stick if a navigation never reports "done".
const SAFETY_MS = 10000;

// Content-area overlay (covers the main column, not the navbar/sidebar — mirrors
// the moose loading.tsx placement). Shown while a primary-nav link is pending.
const NavigationSpinner = () => {
  const pending = useNavSpinner((s) => s.pending);
  const setPending = useNavSpinner((s) => s.setPending);
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Navigation completed → clear pending. This is the reliable "done" signal for
  // mobile-menu links, whose in-Link probe unmounts on closeMenu() before it can
  // report. (Desktop/sidebar probes also clear themselves; this is harmless there.)
  useEffect(() => {
    setPending(false);
  }, [pathname, setPending]);
  const shownAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearHide = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
    const clearSafety = () => {
      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
    };

    if (pending) {
      clearHide();
      if (!visible) {
        setVisible(true);
        shownAt.current = Date.now();
      }
      clearSafety();
      safetyTimer.current = setTimeout(() => setVisible(false), SAFETY_MS);
    } else if (visible) {
      clearSafety();
      const remaining = Math.max(0, MIN_DISPLAY_MS - (Date.now() - shownAt.current));
      clearHide();
      hideTimer.current = setTimeout(() => setVisible(false), remaining);
    }
  }, [pending, visible]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    },
    []
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <SpinnerLarge />
    </div>
  );
};

export default NavigationSpinner;
