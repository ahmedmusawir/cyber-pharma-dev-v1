import { useAdminDemoStore } from "@/store/useAdminDemoStore";
import type {
  ActionResult,
  AuditEntry,
  BillingLine,
  CurrentOwner,
  MemberRole,
  OwnedStore,
  PharmacySettings,
  StoreMember,
} from "@/types/adminDemo";

// ─────────────────────────────────────────────────────────────────────────────
// Admin Portal Demo Shell — service layer (the SOLE Phase-7 swap point).
//
// Components call ONLY these services — never the Zustand store, never /mocks.
// In the demo, bodies read/mutate the in-memory store via its vanilla getState()
// API (the same pattern Navbar uses for useAuthStore.getState()). At Phase 7 the
// bodies become Supabase + RLS + Stripe; these signatures stay FROZEN.
//
// HARD INVARIANTS held here in code (and asserted in the tests):
//   • inviteMember takes { email, role, jobTitle? } only — NEVER a password.
//   • managePayment / cancelSubscription never charge — mock result only.
//   • Everything owner-scoped — no method takes an ownerId or crosses tenants.
//   • Every STATE-MUTATING action appends an AuditEntry. (Billing actions are
//     visual-only and the AuditAction vocab has no billing verb → they append
//     nothing — deliberate, see BillingService.)
// ─────────────────────────────────────────────────────────────────────────────

// Vanilla store access (non-React call sites).
const store = () => useAdminDemoStore.getState();

// Demo-local id generators. Uniqueness only — not stable across reloads.
let memberSeq = 0;
let storeSeq = 0;
let auditSeq = 0;
const nextMemberId = () => `member-gen-${(memberSeq += 1)}`;
const nextStoreId = () => `store-gen-${(storeSeq += 1)}`;
const nextAuditId = () => `audit-gen-${(auditSeq += 1)}`;

// Avatar initials from a display name (falls back to the email's first letter).
const initialsFrom = (nameOrEmail: string): string => {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? nameOrEmail[0] ?? "?").toUpperCase();
};

// Human label for an audit row given a member.
const memberLabel = (m: StoreMember | undefined, fallback: string): string =>
  m ? m.name || m.email : fallback;

// ── §4. Service contracts ────────────────────────────────────────────────────

export interface OwnerStoresService {
  getOwner(): Promise<CurrentOwner>;
  listMyStores(params?: { search?: string }): Promise<OwnedStore[]>;
  getStore(storeId: string): Promise<OwnedStore>;
  addStore(): Promise<OwnedStore>;
}

export interface StoreMemberService {
  listMembers(storeId: string, params?: { search?: string }): Promise<StoreMember[]>;
  listPendingInvites(storeId: string): Promise<StoreMember[]>;
  // INVITE ONLY — the input type has no password key, by design (the one hard rule).
  inviteMember(input: {
    storeId: string;
    email: string;
    role: MemberRole;
    jobTitle?: string;
  }): Promise<ActionResult>;
  resendInvite(memberId: string): Promise<ActionResult>;
  suspendMember(memberId: string): Promise<ActionResult>;
  unsuspendMember(memberId: string): Promise<ActionResult>;
  sendRecovery(memberId: string): Promise<ActionResult>;
}

export interface BillingService {
  listBilling(): Promise<BillingLine[]>;
  // VISUAL ONLY — no checkout, no charge, no state change.
  managePayment(storeId: string): Promise<ActionResult>;
  cancelSubscription(storeId: string): Promise<ActionResult>;
}

export interface SettingsService {
  getSettings(storeId: string): Promise<PharmacySettings>;
  saveSettings(settings: PharmacySettings): Promise<ActionResult>;
}

export interface AuditService {
  listAudit(): Promise<AuditEntry[]>;
  append(entry: Omit<AuditEntry, "id" | "occurredAt">): Promise<AuditEntry>;
}

// ── Audit (internal-ish: other services call append after a mutation) ─────────

export const auditService: AuditService = {
  /**
   * The owner's own action ledger (newest first).
   * BACKEND_SWAP_NOTES (Phase 7): SELECT FROM audit_log WHERE owner = me, RLS-scoped.
   */
  async listAudit() {
    return store().audit;
  },

  /**
   * Stamp an id + occurredAt and record the entry. Called by the other services
   * after every state mutation — not by components.
   * BACKEND_SWAP_NOTES (Phase 7): INSERT INTO audit_log; the server stamps id/time.
   */
  async append(entry) {
    const full: AuditEntry = {
      ...entry,
      id: nextAuditId(),
      occurredAt: new Date().toISOString(),
    };
    store().appendAudit(full);
    return full;
  },
};

// ── Owner + stores ────────────────────────────────────────────────────────────

export const ownerStoresService: OwnerStoresService = {
  /**
   * The single logged-in owner. Owner-scoped: there is no ownerId parameter.
   * BACKEND_SWAP_NOTES (Phase 7): derive from the authed session, not a param.
   */
  async getOwner() {
    return store().owner;
  },

  /**
   * The owner's own stores ("my stores"). No cross-tenant listing exists.
   * BACKEND_SWAP_NOTES (Phase 7): SELECT my stores, RLS-scoped; search → SQL ILIKE.
   */
  async listMyStores(params) {
    const q = params?.search?.trim().toLowerCase();
    const stores = store().stores;
    if (!q) return stores;
    return stores.filter((s) => s.name.toLowerCase().includes(q));
  },

  /**
   * One owned store by id. Fails loud if it isn't the owner's (no silent null).
   * BACKEND_SWAP_NOTES (Phase 7): SELECT … WHERE id = $1, RLS-scoped.
   */
  async getStore(storeId) {
    const found = store().stores.find((s) => s.storeId === storeId);
    if (!found) throw new Error(`Store not found: ${storeId}`);
    return found;
  },

  /**
   * MOCK: drops a fresh store card so the demo feels alive. NO Stripe, NO charge.
   * BACKEND_SWAP_NOTES (Phase 7): real add-store + Stripe checkout (payment-creates-account).
   * The demo's harvest form proposes these new-store fields — name / NCPDP / NPI /
   * address — to elicit the real requirement from the domain expert; this signature stays no-arg
   * until that contract is locked, so those typed values are not yet persisted.
   */
  async addStore() {
    const newStore: OwnedStore = {
      storeId: nextStoreId(),
      name: "New Pharmacy",
      ncpdp: "0000000",
      npi: "0000000000",
      status: "active",
      subscriptionStatus: "active",
      memberCount: 0,
    };
    store().addStore(newStore);
    await auditService.append({
      action: "added_store",
      target: newStore.name,
      result: "done",
    });
    return newStore;
  },
};

// ── Members (invite-only) ─────────────────────────────────────────────────────

export const storeMemberService: StoreMemberService = {
  /**
   * Roster for one store, optionally filtered by a name/email search.
   * BACKEND_SWAP_NOTES (Phase 7): SELECT members WHERE store = $1, RLS-scoped.
   */
  async listMembers(storeId, params) {
    const q = params?.search?.trim().toLowerCase();
    const rows = store().members.filter((m) => m.storeId === storeId);
    if (!q) return rows;
    return rows.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  },

  /**
   * The store's outstanding invites (accountStatus === 'invite_pending').
   * BACKEND_SWAP_NOTES (Phase 7): SELECT … WHERE status = 'invite_pending'.
   */
  async listPendingInvites(storeId) {
    return store().members.filter(
      (m) => m.storeId === storeId && m.accountStatus === "invite_pending"
    );
  },

  /**
   * THE ONE HARD RULE, IN CODE: invite by email + role only. There is NO password
   * parameter — a new member starts as 'invite_pending' with no credential.
   * BACKEND_SWAP_NOTES (Phase 7): real Supabase invite (magic link) + RLS; STILL no
   * password set here — the invitee sets their own credential out of band.
   */
  async inviteMember({ storeId, email, role, jobTitle }) {
    const member: StoreMember = {
      memberId: nextMemberId(),
      storeId,
      name: "",
      email,
      initials: initialsFrom(email),
      jobTitle,
      role,
      accountStatus: "invite_pending",
      invitedAt: new Date().toISOString(),
    };
    store().addMember(member);
    await auditService.append({
      action: "invited_member",
      target: email,
      result: "done",
    });
    return { ok: true, message: `Invite sent to ${email}` };
  },

  /**
   * Re-send an outstanding invite. Mock: toast only; no credential involved.
   * BACKEND_SWAP_NOTES (Phase 7): re-trigger the Supabase invite email.
   */
  async resendInvite(memberId) {
    const m = store().members.find((x) => x.memberId === memberId);
    await auditService.append({
      action: "resent_invite",
      target: memberLabel(m, memberId),
      result: "done",
    });
    return { ok: true, message: "Invite re-sent" };
  },

  /**
   * Suspend a member (flips the account pill to SUSPENDED).
   * BACKEND_SWAP_NOTES (Phase 7): UPDATE members SET status = 'suspended', RLS-scoped.
   */
  async suspendMember(memberId) {
    const m = store().members.find((x) => x.memberId === memberId);
    store().setMemberStatus(memberId, "suspended");
    await auditService.append({
      action: "suspended_member",
      target: memberLabel(m, memberId),
      result: "done",
    });
    return { ok: true, message: "Member suspended" };
  },

  /**
   * Un-suspend a member (flips the pill back to ACTIVE).
   * BACKEND_SWAP_NOTES (Phase 7): UPDATE members SET status = 'active', RLS-scoped.
   */
  async unsuspendMember(memberId) {
    const m = store().members.find((x) => x.memberId === memberId);
    store().setMemberStatus(memberId, "active");
    await auditService.append({
      action: "unsuspended_member",
      target: memberLabel(m, memberId),
      result: "done",
    });
    return { ok: true, message: "Member un-suspended" };
  },

  /**
   * Send an account-recovery link. Mock: toast only; no password is set or shown.
   * BACKEND_SWAP_NOTES (Phase 7): trigger Supabase password-recovery email.
   */
  async sendRecovery(memberId) {
    const m = store().members.find((x) => x.memberId === memberId);
    await auditService.append({
      action: "sent_recovery",
      target: memberLabel(m, memberId),
      result: "done",
    });
    return { ok: true, message: "Recovery link sent" };
  },
};

// ── Billing (VISUAL ONLY — never charges) ─────────────────────────────────────

export const billingService: BillingService = {
  /**
   * Per-store billing lines (display strings — demo, not real money).
   * BACKEND_SWAP_NOTES (Phase 7): join Stripe subscriptions; amounts become real.
   */
  async listBilling() {
    return store().billing;
  },

  /**
   * VISUAL ONLY. Opens a mock "manage payment" dialog — no checkout, no charge,
   * no state change, no audit entry (the AuditAction vocab has no billing verb).
   * BACKEND_SWAP_NOTES (Phase 7): open the real Stripe customer portal.
   */
  async managePayment(_storeId) {
    return { ok: true, message: "Opening payment management (demo — no charge)" };
  },

  /**
   * VISUAL ONLY. Mock cancel dialog — no real cancellation, no charge, no state
   * change, no audit entry.
   * BACKEND_SWAP_NOTES (Phase 7): real Stripe subscription cancel.
   */
  async cancelSubscription(_storeId) {
    return { ok: true, message: "Subscription cancel (demo — no charge)" };
  },
};

// ── Settings (in-memory) ──────────────────────────────────────────────────────

export const settingsService: SettingsService = {
  /**
   * One store's pharmacy settings. Fails loud if missing (no silent null).
   * BACKEND_SWAP_NOTES (Phase 7): SELECT settings WHERE store = $1, RLS-scoped.
   */
  async getSettings(storeId) {
    const found = store().settings.find((s) => s.storeId === storeId);
    if (!found) throw new Error(`Settings not found for store: ${storeId}`);
    return found;
  },

  /**
   * Save edits in-memory (refresh resets — by design).
   * BACKEND_SWAP_NOTES (Phase 7): UPDATE pharmacy_settings, RLS-scoped.
   */
  async saveSettings(settings) {
    store().setSettings(settings);
    await auditService.append({
      action: "updated_settings",
      target: settings.pharmacyName,
      result: "done",
    });
    return { ok: true, message: "Settings saved" };
  },
};
