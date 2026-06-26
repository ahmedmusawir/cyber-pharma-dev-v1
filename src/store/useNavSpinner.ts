import { create } from "zustand";

// Drives the global navigation spinner overlay. A LinkPendingProbe rendered
// inside each primary-nav <Link> flips `pending` via Next's useLinkStatus;
// NavigationSpinner reads it and applies a min-display window so the spinner is
// visible even when the mock services resolve instantly. No persist.
interface NavSpinnerState {
  pending: boolean;
  setPending: (pending: boolean) => void;
}

export const useNavSpinner = create<NavSpinnerState>((set) => ({
  pending: false,
  setPending: (pending) => set({ pending }),
}));
