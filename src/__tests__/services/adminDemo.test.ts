import {
  auditService,
  billingService,
  ownerStoresService,
  settingsService,
  storeMemberService,
} from "@/services/adminDemo";
import { useAdminDemoStore } from "@/store/useAdminDemoStore";

// Intent: the demo is mock-functional AND safe. These tests pin the four hard
// invariants that survive into Phase 7 (the contract the swap must keep), plus
// the read/mutate behaviors. Assertions check DELTAS and behaviors, never
// absolute seed counts — so Cluster 3's seed expansion cannot break them.

const STORE_ID = "store-1";

beforeEach(() => {
  // Each test starts from a pristine seed (in-memory store is a singleton).
  useAdminDemoStore.getState().reset();
});

describe("adminDemo services — owner-scoped (no cross-tenant surface)", () => {
  it("exposes exactly one owner and never takes an ownerId", async () => {
    const owner = await ownerStoresService.getOwner();
    expect(owner.ownerId).toBeTruthy();
    expect(owner.email).toContain("@");

    // Compile-time guard (type-checked but NEVER executed): listMyStores is
    // owner-scoped — it accepts an optional { search } object, NOT an ownerId.
    const _ownerScoped = () => {
      // @ts-expect-error owner-scoped: there is no ownerId parameter
      ownerStoresService.listMyStores("owner-2");
    };
    expect(typeof _ownerScoped).toBe("function");
  });

  it("lists my stores and resolves one by id (fails loud if absent)", async () => {
    const stores = await ownerStoresService.listMyStores();
    expect(stores.length).toBeGreaterThan(0);
    expect(stores.every((s) => Boolean(s.storeId))).toBe(true);

    const one = await ownerStoresService.getStore(STORE_ID);
    expect(one.storeId).toBe(STORE_ID);

    await expect(ownerStoresService.getStore("nope")).rejects.toThrow(
      /not found/i
    );
  });
});

describe("THE ONE HARD RULE — invite-only, never a password", () => {
  it("inviteMember creates an invite_pending member with no credential", async () => {
    const before = await storeMemberService.listPendingInvites(STORE_ID);
    const res = await storeMemberService.inviteMember({
      storeId: STORE_ID,
      email: "newhire@hydeparkrx.com",
      role: "member",
      jobTitle: "Pharmacist",
    });
    expect(res.ok).toBe(true);

    const after = await storeMemberService.listPendingInvites(STORE_ID);
    expect(after.length).toBe(before.length + 1);

    const invited = after.find((m) => m.email === "newhire@hydeparkrx.com");
    expect(invited).toBeDefined();
    expect(invited?.accountStatus).toBe("invite_pending");
    expect(invited?.invitedAt).toBeTruthy();
    // No credential field exists on the shape at all — the type guarantees it.
    expect(invited && "password" in invited).toBe(false);
  });

  it("inviteMember bumps the store's memberCount in step with the roster", async () => {
    const before = (await ownerStoresService.getStore(STORE_ID)).memberCount;
    await storeMemberService.inviteMember({
      storeId: STORE_ID,
      email: "another@hydeparkrx.com",
      role: "member",
    });
    const after = (await ownerStoresService.getStore(STORE_ID)).memberCount;
    expect(after).toBe(before + 1);
  });

  it("REJECTS a password key at COMPILE TIME (build fails, not a runtime check)", () => {
    // Compile-time guard (type-checked but NEVER executed): the inviteMember input
    // type has no password key, so a `password` property fails the build.
    const _noPassword = () => {
      storeMemberService.inviteMember({
        storeId: STORE_ID,
        email: "x@hydeparkrx.com",
        role: "member",
        // @ts-expect-error the one hard rule: inviteMember never accepts a password
        password: "hunter2",
      });
    };
    expect(typeof _noPassword).toBe("function");
  });
});

describe("billing — VISUAL ONLY, never charges, never audited", () => {
  it("managePayment / cancelSubscription return ok without changing money or state", async () => {
    const billingBefore = await billingService.listBilling();
    const amountsBefore = billingBefore.map((b) => b.amountLabel);
    const auditBefore = (await auditService.listAudit()).length;

    const pay = await billingService.managePayment(STORE_ID);
    const cancel = await billingService.cancelSubscription(STORE_ID);
    expect(pay.ok).toBe(true);
    expect(cancel.ok).toBe(true);

    const billingAfter = await billingService.listBilling();
    expect(billingAfter.map((b) => b.amountLabel)).toEqual(amountsBefore);

    // Deliberate (K7): no AuditAction vocab covers billing → no audit row added.
    expect((await auditService.listAudit()).length).toBe(auditBefore);
  });
});

describe("every STATE-MUTATING action appends exactly one AuditEntry", () => {
  // Helper: run a mutation, assert the ledger grew by one with the given action.
  async function expectAudits(
    action: string,
    mutate: () => Promise<unknown>
  ): Promise<void> {
    const before = await auditService.listAudit();
    await mutate();
    const after = await auditService.listAudit();
    expect(after.length).toBe(before.length + 1);
    expect(after[0].action).toBe(action); // newest first
  }

  it("suspend → suspended_member, and the pill flips", async () => {
    await expectAudits("suspended_member", () =>
      storeMemberService.suspendMember("member-1")
    );
    const roster = await storeMemberService.listMembers(STORE_ID);
    expect(roster.find((m) => m.memberId === "member-1")?.accountStatus).toBe(
      "suspended"
    );
  });

  it("unsuspend → unsuspended_member, and the pill flips back", async () => {
    await expectAudits("unsuspended_member", () =>
      storeMemberService.unsuspendMember("member-3")
    );
    const roster = await storeMemberService.listMembers(STORE_ID);
    expect(roster.find((m) => m.memberId === "member-3")?.accountStatus).toBe(
      "active"
    );
  });

  it("resendInvite → resent_invite (no state change)", async () => {
    await expectAudits("resent_invite", () =>
      storeMemberService.resendInvite("member-2")
    );
  });

  it("sendRecovery → sent_recovery (toast only, no credential)", async () => {
    await expectAudits("sent_recovery", () =>
      storeMemberService.sendRecovery("member-1")
    );
  });

  it("addStore → added_store, and a new card appears", async () => {
    const before = (await ownerStoresService.listMyStores()).length;
    await expectAudits("added_store", () => ownerStoresService.addStore());
    expect((await ownerStoresService.listMyStores()).length).toBe(before + 1);
  });

  it("saveSettings → updated_settings, and the edit persists in-memory", async () => {
    const settings = await settingsService.getSettings(STORE_ID);
    await expectAudits("updated_settings", () =>
      settingsService.saveSettings({ ...settings, phone: "(312) 555-9999" })
    );
    expect((await settingsService.getSettings(STORE_ID)).phone).toBe(
      "(312) 555-9999"
    );
  });
});

describe("roster reads — search + pending filter", () => {
  it("filters the roster by a self-seeded search term (no-match yields empty)", async () => {
    await storeMemberService.inviteMember({
      storeId: STORE_ID,
      email: "searchme@hydeparkrx.com",
      role: "member",
    });
    const hit = await storeMemberService.listMembers(STORE_ID, {
      search: "searchme",
    });
    expect(hit.some((m) => m.email === "searchme@hydeparkrx.com")).toBe(true);

    const miss = await storeMemberService.listMembers(STORE_ID, {
      search: "zzz-no-such-member",
    });
    expect(miss).toHaveLength(0);
  });

  it("listPendingInvites returns only invite_pending rows", async () => {
    const pending = await storeMemberService.listPendingInvites(STORE_ID);
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((m) => m.accountStatus === "invite_pending")).toBe(true);
  });
});
