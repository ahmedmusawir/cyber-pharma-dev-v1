import type {
  OwedBookFilters,
  OwedBookKpis,
  OwedBookPage,
  OwedBookSummaryRow,
  OwedTab,
} from "@/types/OwedBook";

export interface OwedBookService {
  /**
   * KPI tile values for the current filter set.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns fixtures; real impl aggregates
   * user_data joined with reference tables, scoped by RLS to the caller's business_id(s).
   */
  getKpis(filters: OwedBookFilters): Promise<OwedBookKpis>;

  /**
   * Paginated ledger rows for a given tab + filter set.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns demo fixtures filtered in-memory;
   * real impl queries user_data with WHERE/ORDER/LIMIT, RLS-scoped.
   */
  getRows(tab: OwedTab, filters: OwedBookFilters, page: number): Promise<OwedBookPage>;

  /**
   * Summary-tab aggregate (PBM -> commercial/federal dollars).
   * BACKEND_SWAP_NOTES (Phase 3): mock aggregates fixtures; real impl GROUP BY pbm.
   */
  getSummary(filters: OwedBookFilters): Promise<OwedBookSummaryRow[]>;

  /**
   * Distinct PBM names for the MultiSelect filter.
   * BACKEND_SWAP_NOTES (Phase 3): mock returns the fixture PBM list; real impl
   * SELECT DISTINCT pbm FROM user_data (RLS-scoped).
   */
  getPbmOptions(): Promise<string[]>;
}

const DEFAULT_LIMIT = 25;

// C2 thin stub — every method returns the zero/empty value so the screen
// renders skeleton + empty-state correctly. C3 swaps the bodies for the
// mock-backed implementation reading from src/mocks/owedbook.ts.
export const owedBookService: OwedBookService = {
  async getKpis(_filters) {
    return {
      commercial_underpaid: 0,
      commercial_scripts: 0,
      updated_difference: 0,
      owed: 0,
    };
  },

  async getRows(_tab, _filters, page) {
    return {
      rows: [],
      page,
      pageCount: 0,
      limit: DEFAULT_LIMIT,
      total: 0,
    };
  },

  async getSummary(_filters) {
    return [];
  },

  async getPbmOptions() {
    return [];
  },
};
