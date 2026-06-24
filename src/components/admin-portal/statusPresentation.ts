import type { PillTone } from "@/components/admin-portal/StatusPill";
import type {
  AuditAction,
  MemberAccountStatus,
  OwnedStore,
  SubscriptionStatus,
} from "@/types/adminDemo";

// Deterministic vocab → presentation mappings (Rule K5: code, not the LLM).
// One source of truth for every status pill + audit-action label on the
// Admin Portal screens. Labels are display copy; tones map to existing tokens.

export interface PillSpec {
  tone: PillTone;
  label: string;
}

export const memberStatusPill: Record<MemberAccountStatus, PillSpec> = {
  active: { tone: "success", label: "Active" },
  invite_pending: { tone: "warning", label: "Invite pending" },
  suspended: { tone: "destructive", label: "Suspended" },
};

export const subscriptionPill: Record<SubscriptionStatus, PillSpec> = {
  active: { tone: "success", label: "Active" },
  past_due: { tone: "warning", label: "Past-due" },
  canceled: { tone: "destructive", label: "Canceled" },
};

// A store "needs attention" when it's suspended or its subscription isn't
// active — drives the My Stores card pill + the glance count.
export const storeNeedsAttention = (s: OwnedStore): boolean =>
  s.status === "suspended" || s.subscriptionStatus !== "active";

export const storeStatusPill = (s: OwnedStore): PillSpec =>
  storeNeedsAttention(s)
    ? { tone: "warning", label: "Needs attention" }
    : { tone: "success", label: "Active" };

// Sentence-case label per audit verb (the enum is the source; mockup wording
// like "Sent invite" is cosmetic — the contract's vocab wins).
export const auditActionLabel: Record<AuditAction, string> = {
  invited_member: "Invited member",
  resent_invite: "Resent invite",
  suspended_member: "Suspended member",
  unsuspended_member: "Un-suspended member",
  sent_recovery: "Sent recovery",
  added_store: "Added store",
  updated_settings: "Updated settings",
};
