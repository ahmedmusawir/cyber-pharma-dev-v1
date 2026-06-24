import type { AdminDemoState } from "@/types/adminDemo";

// Admin Portal Demo Shell — mock seed. DELETABLE in one commit: at Phase 7 the
// service bodies swap to Supabase/RLS/Stripe and this whole layer disappears.
//
// ⚠️ MINIMAL C2 SCAFFOLD. This seed only has to (a) satisfy the full
// AdminDemoState shape so the store compiles, and (b) carry enough rows for the
// service-invariant tests (one of each member status, a billing line, settings).
// CLUSTER 3 EXPANDS this to exercise EVERY rendered state per DATA_CONTRACT §5 /
// Gate 3 (≥4 stores incl. past_due/suspended/zero-member + a toggleable
// zero-store path; all billing/audit variants; a search no-match). Do not treat
// the counts here as final.

// Returns a FRESH deep copy each call so the store can reset() to a pristine
// seed between refreshes/tests without mutation bleed across runs.
export function makeAdminDemoSeed(): AdminDemoState {
  return {
    owner: {
      ownerId: "owner-1",
      name: "Barack Obama",
      email: "barack@hydeparkrx.com",
      initials: "BO",
    },
    stores: [
      {
        storeId: "store-1",
        name: "Hyde Park Pharmacy",
        ncpdp: "1234567",
        npi: "1987654321",
        status: "active",
        subscriptionStatus: "active",
        memberCount: 3,
      },
    ],
    members: [
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
    ],
    audit: [
      {
        id: "audit-1",
        occurredAt: "2026-06-20T14:30:00.000Z",
        action: "invited_member",
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
    ],
  };
}
