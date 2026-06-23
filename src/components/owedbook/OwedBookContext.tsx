"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { owedBookService } from "@/services/owedbook";
import type { OwedBookFilters } from "@/types/OwedBook";

// Filter state shared across the /owedbook surface so the FilterRail (which now
// lives INSIDE the left sidebar) can drive the OwedBookScreen (which renders the
// main pane). Surface-scoped React context — NOT global/Zustand state, so the
// "surface is route-derived, no new global state" rule (§B) still holds.
interface OwedBookCtx {
  filters: OwedBookFilters;
  pbmOptions: string[];
  applyFilters: (f: OwedBookFilters) => void;
  clearFilters: () => void;
  appliedTick: number; // bumps on every apply/clear — drawer-close signal
}

// Count of ACTIVE (applied) filters — shared by the rail + the main-screen badge.
export const countActiveFilters = (f: OwedBookFilters): number =>
  (f.from ? 1 : 0) + (f.to ? 1 : 0) + (f.pbms.length > 0 ? 1 : 0) + (f.filter ? 1 : 0);

const EMPTY: OwedBookFilters = { pbms: [] };

const OwedBookContext = createContext<OwedBookCtx>({
  filters: EMPTY,
  pbmOptions: [],
  applyFilters: () => {},
  clearFilters: () => {},
  appliedTick: 0,
});

export const useOwedBook = () => useContext(OwedBookContext);

export const OwedBookProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<OwedBookFilters>(EMPTY);
  const [pbmOptions, setPbmOptions] = useState<string[]>([]);
  const [appliedTick, setAppliedTick] = useState(0);

  // Distinct PBM names for the filter — load once.
  useEffect(() => {
    let cancelled = false;
    owedBookService
      .getPbmOptions()
      .then((o) => !cancelled && setPbmOptions(o))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Each apply/clear bumps appliedTick so the mobile drawer can dismiss itself
  // (it covers the results otherwise) — same pattern as close-on-navigation.
  const applyFilters = useCallback((f: OwedBookFilters) => {
    setFilters(f);
    setAppliedTick((t) => t + 1);
  }, []);
  const clearFilters = useCallback(() => {
    setFilters(EMPTY);
    setAppliedTick((t) => t + 1);
  }, []);

  return (
    <OwedBookContext.Provider
      value={{ filters, pbmOptions, applyFilters, clearFilters, appliedTick }}
    >
      {children}
    </OwedBookContext.Provider>
  );
};
