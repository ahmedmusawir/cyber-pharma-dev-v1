import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// C4a scaffold — Billing placeholder. C4b adds the per-store BillingRow list
// (Manage payment / Cancel are VISUAL ONLY — no real charge, no audit entry).
const BillingPage = () => {
  return (
    <div>
      <ScreenHeader title="Billing" subtitle="Subscriptions and payment — demo only, no real charges." />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default BillingPage;
