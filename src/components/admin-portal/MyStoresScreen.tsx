"use client";

import { useCallback, useEffect, useState } from "react";
import { Store } from "lucide-react";
import ScreenHeader from "@/components/admin-portal/ScreenHeader";
import StoreCard from "@/components/admin-portal/StoreCard";
import EmptyState from "@/components/common/EmptyState";
import { storeNeedsAttention } from "@/components/admin-portal/statusPresentation";
import { ownerStoresService } from "@/services/adminDemo";
import type { OwnedStore } from "@/types/adminDemo";

const CardSkeleton = () => (
  <div
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    data-testid="stores-skeleton"
  >
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-[140px] bg-muted animate-pulse" />
    ))}
  </div>
);

const MyStoresScreen = () => {
  const [stores, setStores] = useState<OwnedStore[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    ownerStoresService
      .listMyStores()
      .then((s) => {
        if (!cancelled) {
          setStores(s);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load stores");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const needAttention = stores?.filter(storeNeedsAttention).length ?? 0;

  return (
    <div>
      <ScreenHeader
        title="My Stores"
        subtitle="Manage your pharmacies, members, and billing."
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
          <CardSkeleton />
        </div>
      ) : stores && stores.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Store className="h-10 w-10" />}
            headline="No stores yet"
            subcopy="Add a store from Billing to get started."
          />
        </div>
      ) : (
        <>
          <p className="mb-3.5 mt-[18px] text-[13px] text-muted-foreground">
            <b className="font-semibold text-foreground">
              {stores!.length} {stores!.length === 1 ? "store" : "stores"}
            </b>{" "}
            ·{" "}
            <b className="font-semibold text-foreground">{needAttention}</b>{" "}
            {needAttention === 1 ? "needs" : "need"} attention
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stores!.map((s) => (
              <StoreCard key={s.storeId} store={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyStoresScreen;
