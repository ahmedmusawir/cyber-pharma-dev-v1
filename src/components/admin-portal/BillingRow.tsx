"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import StatusPill from "@/components/admin-portal/StatusPill";
import { subscriptionPill } from "@/components/admin-portal/statusPresentation";
import { formatChargeDate } from "@/components/admin-portal/format";
import { billingService } from "@/services/adminDemo";
import type { ActionResult, BillingLine, BillingPlan } from "@/types/adminDemo";

const PLAN_LABEL: Record<BillingPlan, string> = {
  standard: "Standard",
  concierge: "Concierge",
};

// One billing line. Manage payment / Cancel are VISUAL ONLY — they toast a
// "demo — no charge" message and change no state (the service never charges).
const BillingRow = ({ line }: { line: BillingLine }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const pill = subscriptionPill[line.subscriptionStatus];

  const when = line.nextChargeDate
    ? `Next charge ${formatChargeDate(line.nextChargeDate)}`
    : line.retryDate
      ? `Retry ${formatChargeDate(line.retryDate)}`
      : "No upcoming charge";

  const run = async (fn: () => Promise<ActionResult>) => {
    setBusy(true);
    try {
      const res = await fn();
      toast({ title: res.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-card border border-border p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">{line.storeName}</p>
        <p className="text-[13px] text-muted-foreground">
          {PLAN_LABEL[line.plan]} · {line.amountLabel} · {when}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => run(() => billingService.managePayment(line.storeId))}
          >
            Manage payment
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => run(() => billingService.cancelSubscription(line.storeId))}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillingRow;
