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
}

const EMPTY: OwedBookFilters = { pbms: [] };

const OwedBookContext = createContext<OwedBookCtx>({
  filters: EMPTY,
  pbmOptions: [],
  applyFilters: () => {},
  clearFilters: () => {},
});

export const useOwedBook = () => useContext(OwedBookContext);

export const OwedBookProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<OwedBookFilters>(EMPTY);
  const [pbmOptions, setPbmOptions] = useState<string[]>([]);

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

  const applyFilters = useCallback((f: OwedBookFilters) => setFilters(f), []);
  const clearFilters = useCallback(() => setFilters(EMPTY), []);

  return (
    <OwedBookContext.Provider value={{ filters, pbmOptions, applyFilters, clearFilters }}>
      {children}
    </OwedBookContext.Provider>
  );
};
