import type { AdminDemoState } from "@/types/adminDemo";

// Admin Portal Demo Shell — mock seed. DELETABLE in one commit: at Phase 7 the
// service bodies swap to Supabase/RLS/Stripe and this whole layer disappears.
//
// CLUSTER 3: full state coverage (DATA_CONTRACT §5 / Gate 3). The seed exercises
// EVERY rendered state so the C4 screens never invent data:
//   • 4 stores — active+SUB ACTIVE / past_due (PAST-DUE) / suspended (canceled) /
//     zero-member — with a toggleable zero-store path for "No stores yet".
//   • one store (store-1) carries all 3 member statuses + a pending invite.
//   • billing covers active(nextChargeDate)+past_due(retryDate), standard+concierge.
//   • ≥1 audit entry per AuditAction (all 7) + one 'failed' result.
//   • settings one per store.
//   • no member contains the substring "rav" → a "rav" search hits "No members match".
// The src/__tests__/mocks/adminDemo.seed.test.ts suite fails loud if any of the
// above ever regresses.

// Demo-rehearsal knob (lives + dies in this DELETABLE file — NOT an env var):
// flip to `true` (or call makeAdminDemoSeed({ empty: true })) to demonstrate the
// "No stores yet" EmptyState.
const ADMIN_DEMO_NO_STORES = false;

// Returns a FRESH deep copy each call so the store can reset() to a pristine
// seed between refreshes/tests without mutation bleed across runs.
export function makeAdminDemoSeed(opts?: { empty?: boolean }): AdminDemoState {
  const owner = {
    ownerId: "owner-1",
    name: "Barack Obama",
    email: "barack@hydeparkrx.com",
    initials: "BO",
  };

  // Zero-store path: brand-new owner, nothing provisioned yet.
  if (opts?.empty ?? ADMIN_DEMO_NO_STORES) {
    return { owner, stores: [], members: [], billing: [], audit: [], settings: [] };
  }

  return {
    owner,
    stores: [
      {
        storeId: "store-1",
        name: "Hyde Park Pharmacy",
        ncpdp: "1453792",
        npi: "1987654321",
        status: "active",
        subscriptionStatus: "active",
        memberCount: 3,
      },
      {
        storeId: "store-2",
        name: "Southside Drug Mart",
        ncpdp: "1620085",
        npi: "1750493827",
        status: "active",
        subscriptionStatus: "past_due",
        memberCount: 2,
      },
      {
        storeId: "store-3",
        name: "Lakeview Apothecary",
        ncpdp: "1338476",
        npi: "1629384756",
        status: "suspended",
        subscriptionStatus: "canceled",
        memberCount: 2,
      },
      {
        storeId: "store-4",
        name: "Cornerstone Pharmacy",
        ncpdp: "1591037",
        npi: "1456372819",
        status: "active",
        subscriptionStatus: "active",
        memberCount: 0, // zero-member → empty roster
      },
    ],
    members: [
      // store-1 — the all-3-statuses store (anchors for the C2 invariant tests)
      {
        memberId: "member-1",
        storeId: "store-1",
        name: "Tina Cho",
        email: "tina@hydeparkrx.com",
        initials: "TC",
        jobTitle: "Pharmacist",
        role: "member",
        accountStatus: "active",
      },
      {
        memberId: "member-2",
        storeId: "store-1",
        name: "", // invite_pending → roster renders the email
        email: "jane@hydeparkrx.com",
        initials: "J",
        jobTitle: "Technician",
        role: "member",
        accountStatus: "invite_pending",
        invitedAt: "2026-06-20T14:30:00.000Z",
      },
      {
        memberId: "member-3",
        storeId: "store-1",
        name: "Raj Patel",
        email: "raj@hydeparkrx.com",
        initials: "RP",
        jobTitle: "Pharmacist",
        role: "member",
        accountStatus: "suspended",
      },
      // store-2 — two active (one admin, one member)
      {
        memberId: "member-4",
        storeId: "store-2",
        name: "Denise Okafor",
        email: "denise@southsidedrug.com",
        initials: "DO",
        jobTitle: "Pharmacist",
        role: "member",
        accountStatus: "active",
      },
      {
        memberId: "member-5",
        storeId: "store-2",
        name: "Marcus Lee",
        email: "marcus@southsidedrug.com",
        initials: "ML",
        jobTitle: "Technician",
        // V1: no non-owner admin in the public app (one admin = owner via
        // onboarding; 2nd admins only via MissionControl). role isn't rendered,
        // so this is data-truth only. See memory admin-v1-single-admin-model.
        role: "member",
        accountStatus: "active",
      },
      // store-3 — one active, one suspended
      {
        memberId: "member-6",
        storeId: "store-3",
        name: "Priya Nair",
        email: "priya@lakeviewrx.com",
        initials: "PN",
        jobTitle: "Pharmacist",
        role: "member",
        accountStatus: "active",
      },
      {
        memberId: "member-7",
        storeId: "store-3",
        name: "Tom Becker",
        email: "tom@lakeviewrx.com",
        initials: "TB",
        jobTitle: "Technician",
        role: "member",
        accountStatus: "suspended",
      },
      // store-4 — no members (zero-member roster)
    ],
    billing: [
      {
        storeId: "store-1",
        storeName: "Hyde Park Pharmacy",
        plan: "standard",
        subscriptionStatus: "active",
        nextChargeDate: "2026-07-01T00:00:00.000Z",
        amountLabel: "$49/mo",
      },
      {
        storeId: "store-2",
        storeName: "Southside Drug Mart",
        plan: "concierge",
        subscriptionStatus: "past_due",
        retryDate: "2026-06-26T00:00:00.000Z",
        amountLabel: "$199/mo",
      },
      {
        storeId: "store-3",
        storeName: "Lakeview Apothecary",
        plan: "standard",
        subscriptionStatus: "canceled",
        amountLabel: "$49/mo",
      },
      {
        storeId: "store-4",
        storeName: "Cornerstone Pharmacy",
        plan: "concierge",
        subscriptionStatus: "active",
        nextChargeDate: "2026-07-05T00:00:00.000Z",
        amountLabel: "$199/mo",
      },
    ],
    // Newest first (matches the store's prepend-on-append). Covers all 7 actions
    // + one 'failed' result.
    audit: [
      {
        id: "audit-1",
        occurredAt: "2026-06-23T16:10:00.000Z",
        action: "added_store",
        target: "Cornerstone Pharmacy",
        result: "done",
      },
      {
        id: "audit-2",
        occurredAt: "2026-06-23T11:05:00.000Z",
        action: "updated_settings",
        target: "Hyde Park Pharmacy",
        result: "done",
      },
      {
        id: "audit-3",
        occurredAt: "2026-06-22T15:40:00.000Z",
        action: "suspended_member",
        target: "Raj Patel",
        result: "done",
      },
      {
        id: "audit-4",
        occurredAt: "2026-06-22T09:20:00.000Z",
        action: "sent_recovery",
        target: "Tina Cho",
        result: "failed", // recovery email bounced — exercises the failed state
      },
      {
        id: "audit-5",
        occurredAt: "2026-06-21T13:00:00.000Z",
        action: "unsuspended_member",
        target: "Tom Becker",
        result: "done",
      },
      {
        id: "audit-6",
        occurredAt: "2026-06-20T14:30:00.000Z",
        action: "invited_member",
        target: "jane@hydeparkrx.com",
        result: "done",
      },
      {
        id: "audit-7",
        occurredAt: "2026-06-19T10:15:00.000Z",
        action: "resent_invite",
        target: "jane@hydeparkrx.com",
        result: "done",
      },
    ],
    settings: [
      {
        storeId: "store-1",
        pharmacyName: "Hyde Park Pharmacy",
        contactPerson: "Barack Obama",
        phone: "(312) 555-0142",
        address: "5046 S Greenwood Ave, Chicago, IL 60615",
        pharmacySoftware: "PioneerRx",
      },
      {
        storeId: "store-2",
        pharmacyName: "Southside Drug Mart",
        contactPerson: "Barack Obama",
        phone: "(312) 555-0288",
        address: "1342 E 79th St, Chicago, IL 60619",
        pharmacySoftware: "QS/1",
      },
      {
        storeId: "store-3",
        pharmacyName: "Lakeview Apothecary",
        contactPerson: "Barack Obama",
        phone: "(773) 555-0173",
        address: "3211 N Broadway, Chicago, IL 60657",
        pharmacySoftware: "Liberty",
      },
      {
        storeId: "store-4",
        pharmacyName: "Cornerstone Pharmacy",
        contactPerson: "Barack Obama",
        phone: "(312) 555-0391",
        address: "700 W Madison St, Chicago, IL 60661",
        pharmacySoftware: "Rx30",
      },
    ],
  };
}
