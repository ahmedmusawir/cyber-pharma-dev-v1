# DATA_CONTRACT — Admin Portal Demo Shell (OwedBook / Extended Phase 2)

**Document type:** DATA_CONTRACT (demo-shell scope)
**Author:** Architect (Claude/Jarvis), MissionControl lab
**Version:** 1.0 · **Date:** 2026-06-23
**Companion to:** `UI_SPEC_AdminPortalDemo_v1_0` · `AdminPortal_DEMO_APP_BRIEF` · component-states sheet (Mist + Slate)
**Naming:** "Admin Portal Demo Shell" — **NOT StoreLens.**

> **What this drives:** the **mock data** for a high-fidelity, owner-scoped admin portal inside OwedBook. Everything here is **in-memory (Zustand), no persistence** — clicking actually mutates state so the demo feels alive, but a refresh resets it. The **service layer is the sole Phase-7 swap point**: Phase 7 replaces the mock bodies with real Supabase + RLS + Stripe; these types and signatures do not change.
> **Conflict rule:** the App Brief gates + the one hard rule (invite-only, no password field) win over everything here.

---

## 0. The Demo-Specific Shape (read first)

Unlike a read-only console, this demo is **mock-functional** — actions mutate an in-memory dataset:

1. **`/mocks`** seeds the initial dataset (deletable in one commit).
2. A **Zustand store** holds that dataset as live state.
3. The **service layer** reads from and mutates that store. Components only ever call services — never the store directly.
4. At **Phase 7**, the service bodies are swapped for real Supabase/RLS/Stripe. Components, types, and the store contract stay.

Everything is **owner-scoped**: there is exactly one logged-in owner; every list is implicitly "my own." No `ownerId` filtering UI, no platform views.

---

## 1. Status Vocabularies (single source — back every pill)

```typescript
// Member account state (drives ACTIVE / INVITE PENDING / SUSPENDED pills)
export type MemberAccountStatus = 'active' | 'invite_pending' | 'suspended';

// Member permission role (Frank truth: admin | user). Demo shows jobTitle separately (§2.3).
export type MemberRole = 'admin' | 'member';

// Store operational status
export type StoreStatus = 'active' | 'suspended';

// Subscription mirror (drives SUB ACTIVE / PAST-DUE pills)
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

// Billing plan (demo values; Phase-7 maps to real Stripe price/plan_type)
export type BillingPlan = 'standard' | 'concierge';

// Audit action vocabulary (the owner's own actions)
export type AuditAction =
  | 'invited_member' | 'resent_invite'
  | 'suspended_member' | 'unsuspended_member' | 'sent_recovery'
  | 'added_store' | 'updated_settings';
```

**Pill mapping (UI_SPEC §2 / style-tile delta):** `active`/`success` · `invite_pending`,`past_due`/`warning` · `suspended`,`canceled`/`destructive` · counts/avatars/`info`. The **"Demo · mock data"** marker is a constant, not data (built from `--warning` — see style-tile delta).

---

## 2. View-Models (what the services return)

### 2.1 Current owner (the logged-in context)

```typescript
// One owner, sourced from real auth (login stays real per OwedBook Phase 2); his data is mock.
export interface CurrentOwner {
  ownerId: string;
  name: string;
  email: string;
  initials: string; // derived from name, for the avatar
}
```

### 2.2 Owned store (My Stores card + store-detail header)

```typescript
export interface OwnedStore {
  storeId: string;
  name: string;               // pharmacy name
  ncpdp: string;
  npi: string;
  status: StoreStatus;        // store-level pill
  subscriptionStatus: SubscriptionStatus; // "SUB ACTIVE" / "PAST-DUE" footer pill
  memberCount: number;
}
```

### 2.3 Store member (roster row + invite result)

```typescript
export interface StoreMember {
  memberId: string;
  storeId: string;
  name: string;               // for invite_pending rows, may be empty → render email
  email: string;
  initials: string;
  jobTitle?: string;          // ⚠️ DEMO-ONLY display (pharmacist/technician). Unbacked in Frank's schema — Phase-7 flag (§6).
  role: MemberRole;           // permission role
  accountStatus: MemberAccountStatus;
  invitedAt?: string;         // ISO; present when accountStatus === 'invite_pending'
  // UI derives row actions from accountStatus:
  //   active → [sendRecovery, suspend] · invite_pending → [resendInvite] · suspended → [unsuspend]
}
```

### 2.4 Billing line (per-store billing row)

```typescript
export interface BillingLine {
  storeId: string;
  storeName: string;
  plan: BillingPlan;
  subscriptionStatus: SubscriptionStatus;
  nextChargeDate?: string;    // ISO; present when active
  retryDate?: string;         // ISO; present when past_due
  amountLabel: string;        // display only, e.g. "$49/mo" (demo; Phase-7 = real Stripe)
  // Actions are VISUAL ONLY: managePayment, cancel — no checkout, no charge.
}
```

### 2.5 Audit entry (owner's own actions)

```typescript
export interface AuditEntry {
  id: string;
  occurredAt: string;         // ISO
  action: AuditAction;
  target: string;             // human label, e.g. "Tina Cho" or "Hyde Park Pharmacy"
  result: 'done' | 'failed';
}
```

### 2.6 Pharmacy settings (editable, in-memory)

```typescript
export interface PharmacySettings {
  storeId: string;
  pharmacyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  pharmacySoftware: string;
}
```

### 2.7 Shared action result

```typescript
export interface ActionResult {
  ok: boolean;
  message: string;            // toast copy
}
```

---

## 3. Zustand Store Shape (the live in-memory dataset)

The store is seeded from `/mocks` and mutated by the service layer. This is the demo's "database".

```typescript
export interface AdminDemoState {
  owner: CurrentOwner;
  stores: OwnedStore[];
  members: StoreMember[];     // across all the owner's stores; filter by storeId in services
  billing: BillingLine[];
  audit: AuditEntry[];
  settings: PharmacySettings[]; // one per store
  // mutators are called only by services, never components directly
}
```

Refresh resets to the seed. By design.

---

## 4. Service Contracts (the SOLE Phase-7 swap point)

Components call only these. In the demo, bodies read/mutate the Zustand store; at Phase 7 the bodies become Supabase/RLS/Stripe — signatures frozen. Every mutator appends an `AuditEntry`.

```typescript
export interface OwnerStoresService {
  getOwner(): Promise<CurrentOwner>;
  listMyStores(params?: { search?: string }): Promise<OwnedStore[]>;
  getStore(storeId: string): Promise<OwnedStore>;
  addStore(): Promise<OwnedStore>;          // mock: drops a new card; Phase-7: real add-store + Stripe
}

export interface StoreMemberService {
  listMembers(storeId: string, params?: { search?: string }): Promise<StoreMember[]>;
  listPendingInvites(storeId: string): Promise<StoreMember[]>; // accountStatus === 'invite_pending'
  // INVITE ONLY — never accepts or sets a password.
  inviteMember(input: { storeId: string; email: string; role: MemberRole; jobTitle?: string }): Promise<ActionResult>;
  resendInvite(memberId: string): Promise<ActionResult>;
  suspendMember(memberId: string): Promise<ActionResult>;
  unsuspendMember(memberId: string): Promise<ActionResult>;
  sendRecovery(memberId: string): Promise<ActionResult>;       // mock: toast only
}

export interface BillingService {
  listBilling(): Promise<BillingLine[]>;
  // VISUAL ONLY — no checkout, no charge. These return mock results / open mock dialogs.
  managePayment(storeId: string): Promise<ActionResult>;
  cancelSubscription(storeId: string): Promise<ActionResult>;
}

export interface SettingsService {
  getSettings(storeId: string): Promise<PharmacySettings>;
  saveSettings(settings: PharmacySettings): Promise<ActionResult>; // in-memory
}

export interface AuditService {
  listAudit(): Promise<AuditEntry[]>;
  append(entry: Omit<AuditEntry, 'id' | 'occurredAt'>): Promise<AuditEntry>; // internal
}
```

**Hard invariants enforced in the mock (and later the real service):**
- `inviteMember` takes **email + role** only — **never a password**. The new row is `invite_pending`. (The one hard rule, in code.)
- `managePayment` / `cancelSubscription` **never charge** — visual/mock only.
- No method exposes platform/cross-tenant data; everything is the current owner's.

---

## 5. Mock Data Requirements (seed `/mocks` to exercise every state)

The component-states sheet shows every pill and state — the seed must trigger all of them:

- **Owner:** one `CurrentOwner` (e.g., Barack Obama, barack@hydeparkrx.com).
- **Stores (≥4):** include at least one `active`+`SUB ACTIVE`, one `past_due` (→ PAST-DUE pill), and one `suspended`. Range member counts. One with **zero members** (to show the empty roster). Keep a "318-total"-style feel is NOT needed — this is owner-scoped (a handful of stores).
- **A zero-store path:** the store seed should be toggleable to empty so the **"No stores yet"** EmptyState is demonstrable.
- **Members:** on one store, cover all three `MemberAccountStatus` — `active` (Send recovery / Suspend), `invite_pending` (Resend invite), `suspended` (Un-suspend). Include `jobTitle` flavor (pharmacist, technician). Use truncatable emails (the sheet shows `jane@…`).
- **Pending invites:** at least one `invite_pending` member so the invite screen's "Pending invites" list renders.
- **Billing:** one line per store; cover `active` (nextChargeDate) and `past_due` (retryDate); both `standard` and `concierge` plans; `amountLabel` strings.
- **Audit:** at least one entry per `AuditAction`, including `invited_member`, `suspended_member`, `added_store`.
- **Settings:** one `PharmacySettings` per store.
- **Search:** seed enough members that a search like "rav" yields a no-match → the **"No members match"** EmptyState + Clear search.

---

## 6. Notes & Phase-7 Flags (carried forward — none blocks the demo)

1. **`jobTitle` is demo-only.** Frank's `user_businesses` has `role` (`admin`/`user`), no job-title column. Mock freely here; Phase-7 StoreLens needs a real source decision (display permission role, or add a real field).
2. **Navbar token deviation (needs operator answer).** Designer flagged: renders show **coral navbar in both modes**, but committed `globals.css` sets dark `--navbar` to slate. Decide: coral-both-modes (bump dark `--navbar`) or slate-dark (re-render). Navbar chrome only — no content token affected.
3. **Billing is visual.** `amountLabel`, `plan`, `nextChargeDate` are demo strings. Phase-7 maps to real Stripe price/plan_type + APA single-use discount.
4. **`addStore` is a mock drop.** Phase-7 is real add-store + a Stripe checkout (registration is payment-creates-account per the 8-phase plan Phase 7).
5. **Login may be real** (per OwedBook Phase 2 convention); all **domain is mock**. Service layer is the swap point.

---

## 7. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-23 | Initial demo DATA_CONTRACT authored from the designer's UI_SPEC v1.0 + component-states sheet. Owner-scoped view-models (stores, members, billing, audit, settings), Zustand store shape, 5 mock service contracts with invite-only + no-charge invariants, mock-data requirements covering every rendered state. Carried Phase-7 flags: jobTitle source, navbar token deviation, billing/add-store are mock. |

---

🥄 *Stark Industries — App Factory v1.2. Mock the wiring, never mock the safety. The service layer is the only door to Phase 7.*
