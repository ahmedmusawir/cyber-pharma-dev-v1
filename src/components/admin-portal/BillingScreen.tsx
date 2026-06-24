"use client";

import { useCallback, useEffect, useState } from "react";
import ScreenHeader from "@/components/admin-portal/ScreenHeader";
import AddStoreButton from "@/components/admin-portal/AddStoreButton";
import BillingRow from "@/components/admin-portal/BillingRow";
import { billingService } from "@/services/adminDemo";
import type { BillingLine } from "@/types/adminDemo";

const Skeleton = () => (
  <div className="space-y-3" data-testid="billing-skeleton">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-20 bg-muted animate-pulse" />
    ))}
  </div>
);

const BillingScreen = () => {
  const [lines, setLines] = useState<BillingLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    billingService
      .listBilling()
      .then((b) => {
        if (!cancelled) {
          setLines(b);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load billing");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div>
      <ScreenHeader
        title="Billing & subscription"
        subtitle="Your stores and their billing status."
        action={<AddStoreButton onAdded={reload} />}
      />
      {error ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" className="underline" onClick={reload}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="mt-6">
          <Skeleton />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {lines!.map((line) => (
              <BillingRow key={line.storeId} line={line} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Visual only — no real charge is made in this demo.
          </p>
        </>
      )}
    </div>
  );
};

export default BillingScreen;
