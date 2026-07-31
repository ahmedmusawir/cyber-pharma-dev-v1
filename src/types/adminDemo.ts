// Admin Portal Demo Shell — types (Phase 2.2). Verbatim from DATA_CONTRACT §1–2.
// Mock-functional, owner-scoped preview of the future StoreLens (NOT StoreLens).
// The service layer is the sole Phase-7 swap point; these shapes stay frozen.

// ── §1. Status vocabularies (single source — back every pill) ────────────────

// Member account state (drives ACTIVE / INVITE PENDING / SUSPENDED pills)
export type MemberAccountStatus = "active" | "invite_pending" | "suspended";

// Member permission role (domain-expert truth: admin | user). jobTitle is shown separately (§2.3).
export type MemberRole = "admin" | "member";

// Store operational status
export type StoreStatus = "active" | "suspended";

// Subscription mirror (drives SUB ACTIVE / PAST-DUE pills)
export type SubscriptionStatus = "active" | "past_due" | "canceled";

// Billing plan (demo values; Phase-7 maps to real Stripe price/plan_type)
export type BillingPlan = "standard" | "concierge";

// Audit action vocabulary (the owner's own actions)
export type AuditAction =
  | "invited_member"
  | "resent_invite"
  | "suspended_member"
  | "unsuspended_member"
  | "sent_recovery"
  | "added_store"
  | "updated_settings";

// ── §2. View-models (what the services return) ───────────────────────────────

// One owner, sourced from real auth (login stays real per OwedBook); his data is mock.
export interface CurrentOwner {
  ownerId: string;
  name: string;
  email: string;
  initials: string; // derived from name, for the avatar
}

// My Stores card + store-detail header
export interface OwnedStore {
  storeId: string;
  name: string; // pharmacy name
  ncpdp: string;
  npi: string;
  status: StoreStatus; // store-level pill
  subscriptionStatus: SubscriptionStatus; // "SUB ACTIVE" / "PAST-DUE" footer pill
  memberCount: number;
}

// Roster row + invite result
export interface StoreMember {
  memberId: string;
  storeId: string;
  name: string; // for invite_pending rows may be empty → render email
  email: string;
  initials: string;
  // ⚠️ DEMO-ONLY display (pharmacist/technician). Unbacked in the domain expert's schema —
  // Phase-7 source-decision flag (DATA_CONTRACT §6). Do NOT pretend it's backed.
  jobTitle?: string;
  role: MemberRole; // permission role
  accountStatus: MemberAccountStatus;
  invitedAt?: string; // ISO; present when accountStatus === 'invite_pending'
  // UI derives row actions from accountStatus:
  //   active → [sendRecovery, suspend] · invite_pending → [resendInvite] · suspended → [unsuspend]
}

// Per-store billing row
export interface BillingLine {
  storeId: string;
  storeName: string;
  plan: BillingPlan;
  subscriptionStatus: SubscriptionStatus;
  nextChargeDate?: string; // ISO; present when active
  retryDate?: string; // ISO; present when past_due
  amountLabel: string; // display only, e.g. "$49/mo" (demo; Phase-7 = real Stripe)
  // Actions are VISUAL ONLY: managePayment, cancel — no checkout, no charge.
}

// Owner's own actions
export interface AuditEntry {
  id: string;
  occurredAt: string; // ISO
  action: AuditAction;
  target: string; // human label, e.g. "Tina Cho" or "Hyde Park Pharmacy"
  result: "done" | "failed";
}

// Editable, in-memory
export interface PharmacySettings {
  storeId: string;
  pharmacyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  pharmacySoftware: string;
}

// Shared action result (toast copy)
export interface ActionResult {
  ok: boolean;
  message: string;
}

// ── §3. Zustand store shape (the live in-memory dataset) ─────────────────────
// Seeded from /mocks, mutated ONLY by the service layer (never components).
// Refresh resets to the seed — by design (in-memory, no persistence).
export interface AdminDemoState {
  owner: CurrentOwner;
  stores: OwnedStore[];
  members: StoreMember[]; // across all the owner's stores; filtered by storeId in services
  billing: BillingLine[];
  audit: AuditEntry[];
  settings: PharmacySettings[]; // one per store
}
