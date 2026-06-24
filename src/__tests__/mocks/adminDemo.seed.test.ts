import { makeAdminDemoSeed } from "@/mocks/adminDemo";
import type { AuditAction, MemberAccountStatus } from "@/types/adminDemo";

// Intent: the seed must give the C4 screens data for EVERY rendered state
// (DATA_CONTRACT §5 / Gate 3). This suite is the fail-loud guard — if the seed
// ever stops covering a pill, an empty state, or an audit action, the build's
// tests go red before the screen silently renders a hole.

const seed = makeAdminDemoSeed();

describe("admin-demo seed — Gate 3 state coverage", () => {
  it("has ≥4 stores spanning active / past_due / suspended / zero-member", () => {
    expect(seed.stores.length).toBeGreaterThanOrEqual(4);
    expect(seed.stores.some((s) => s.subscriptionStatus === "active")).toBe(true);
    expect(seed.stores.some((s) => s.subscriptionStatus === "past_due")).toBe(true);
    expect(seed.stores.some((s) => s.status === "suspended")).toBe(true);
    expect(seed.stores.some((s) => s.memberCount === 0)).toBe(true);
  });

  it("memberCount on each store matches its actual roster size", () => {
    for (const store of seed.stores) {
      const actual = seed.members.filter((m) => m.storeId === store.storeId).length;
      expect(store.memberCount).toBe(actual);
    }
  });

  it("one store carries all 3 member statuses incl. ≥1 pending invite", () => {
    const byStore = new Map<string, Set<MemberAccountStatus>>();
    for (const m of seed.members) {
      const set = byStore.get(m.storeId) ?? new Set<MemberAccountStatus>();
      set.add(m.accountStatus);
      byStore.set(m.storeId, set);
    }
    const allThree = [...byStore.values()].some(
      (set) => set.has("active") && set.has("invite_pending") && set.has("suspended")
    );
    expect(allThree).toBe(true);
    expect(seed.members.some((m) => m.accountStatus === "invite_pending")).toBe(true);
  });

  it("billing covers active(nextChargeDate) + past_due(retryDate), both plans", () => {
    const active = seed.billing.find((b) => b.subscriptionStatus === "active");
    const pastDue = seed.billing.find((b) => b.subscriptionStatus === "past_due");
    expect(active?.nextChargeDate).toBeTruthy();
    expect(pastDue?.retryDate).toBeTruthy();
    expect(seed.billing.some((b) => b.plan === "standard")).toBe(true);
    expect(seed.billing.some((b) => b.plan === "concierge")).toBe(true);
  });

  it("audit carries ≥1 entry per AuditAction (all 7) and is newest-first", () => {
    const actions = new Set(seed.audit.map((a) => a.action));
    (
      [
        "invited_member",
        "resent_invite",
        "suspended_member",
        "unsuspended_member",
        "sent_recovery",
        "added_store",
        "updated_settings",
      ] as AuditAction[]
    ).forEach((a) => expect(actions.has(a)).toBe(true));

    const times = seed.audit.map((a) => a.occurredAt);
    expect([...times]).toEqual([...times].sort().reverse());
  });

  it("has exactly one settings entry per store", () => {
    expect(seed.settings).toHaveLength(seed.stores.length);
    const storeIds = new Set(seed.stores.map((s) => s.storeId));
    expect(seed.settings.every((s) => storeIds.has(s.storeId))).toBe(true);
  });

  it("seeds a 'rav' search no-match (drives the 'No members match' EmptyState)", () => {
    const haystack = seed.members
      .flatMap((m) => [m.name, m.email, m.jobTitle ?? ""])
      .join(" ")
      .toLowerCase();
    expect(haystack).not.toContain("rav");
  });

  it("the empty toggle yields a zero-store seed (owner kept)", () => {
    const empty = makeAdminDemoSeed({ empty: true });
    expect(empty.stores).toHaveLength(0);
    expect(empty.members).toHaveLength(0);
    expect(empty.billing).toHaveLength(0);
    expect(empty.settings).toHaveLength(0);
    expect(empty.owner.email).toContain("@");
  });

  it("returns a fresh copy each call (no shared references across resets)", () => {
    const a = makeAdminDemoSeed();
    const b = makeAdminDemoSeed();
    expect(a.stores).not.toBe(b.stores);
    expect(a.members[0]).not.toBe(b.members[0]);
  });
});
