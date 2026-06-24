import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// C4a scaffold — Invite member placeholder. C4b adds InviteMemberForm
// (Email + Job title ONLY — no password, no permission dropdown; the one hard
// rule) plus the pending-invites list. role: 'member' is hardcoded at the form
// call site.
const InviteMemberPage = () => {
  return (
    <div>
      <ScreenHeader title="Invite member" subtitle="Send an invite by email — no password is ever set here." />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default InviteMemberPage;
