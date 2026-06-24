import { create } from "zustand";
import type {
  AdminDemoState,
  AuditEntry,
  MemberAccountStatus,
  OwnedStore,
  PharmacySettings,
  StoreMember,
} from "@/types/adminDemo";
import { makeAdminDemoSeed } from "@/mocks/adminDemo";

// The demo's in-memory "database". IN-MEMORY ONLY — deliberately NOT wrapped in
// `persist` (unlike useAuthStore): a refresh must reset to the seed by design
// (DATA_CONTRACT §3). These actions are the SOLE Phase-7 swap surface's backing
// store — only the service layer calls them; components never touch the store.
interface AdminDemoActions {
  addMember: (member: StoreMember) => void;
  setMemberStatus: (memberId: string, status: MemberAccountStatus) => void;
  addStore: (store: OwnedStore) => void;
  setSettings: (settings: PharmacySettings) => void;
  appendAudit: (entry: AuditEntry) => void;
  reset: () => void; // re-applies the seed (test isolation + "refresh resets")
}

export type AdminDemoStore = AdminDemoState & AdminDemoActions;

export const useAdminDemoStore = create<AdminDemoStore>()((set) => ({
  ...makeAdminDemoSeed(),

  addMember: (member) =>
    set((s) => ({
      members: [...s.members, member],
      // keep the store card's memberCount in step with the roster
      stores: s.stores.map((st) =>
        st.storeId === member.storeId
          ? { ...st, memberCount: st.memberCount + 1 }
          : st
      ),
    })),

  setMemberStatus: (memberId, status) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.memberId === memberId ? { ...m, accountStatus: status } : m
      ),
    })),

  addStore: (store) => set((s) => ({ stores: [...s.stores, store] })),

  setSettings: (settings) =>
    set((s) => ({
      settings: s.settings.map((ps) =>
        ps.storeId === settings.storeId ? settings : ps
      ),
    })),

  // newest first — the audit log reads most-recent at the top
  appendAudit: (entry) => set((s) => ({ audit: [entry, ...s.audit] })),

  // shallow-merges the fresh data slices back in; the action fns are preserved
  reset: () => set(makeAdminDemoSeed()),
}));
