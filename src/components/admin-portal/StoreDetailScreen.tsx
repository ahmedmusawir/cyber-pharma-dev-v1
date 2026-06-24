"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/admin-portal/Breadcrumb";
import DemoMarker from "@/components/admin-portal/DemoMarker";
import StatusPill from "@/components/admin-portal/StatusPill";
import MemberRoster from "@/components/admin-portal/MemberRoster";
import { subscriptionPill } from "@/components/admin-portal/statusPresentation";
import { ownerStoresService, storeMemberService } from "@/services/adminDemo";
import type { OwnedStore, StoreMember } from "@/types/adminDemo";

const Skeleton = () => (
  <div className="space-y-3" data-testid="store-detail-skeleton">
    <div className="h-8 w-1/3 bg-muted animate-pulse" />
    <div className="h-24 bg-muted animate-pulse" />
  </div>
);

const StoreDetailScreen = ({ storeId }: { storeId: string }) => {
  const [store, setStore] = useState<OwnedStore | null>(null);
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      ownerStoresService.getStore(storeId),
      storeMemberService.listMembers(storeId),
    ])
      .then(([s, m]) => {
        if (!cancelled) {
          setStore(s);
          setMembers(m);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load store");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  if (error) {
    return (
      <div className="flex items-center gap-3 text-sm text-destructive">
        <span>{error}</span>
        <button type="button" className="underline" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }

  if (loading || !store) {
    return (
      <div>
        <Breadcrumb items={[{ label: "My Stores", href: "/admin-portal" }, { label: "Store" }]} />
        <Skeleton />
      </div>
    );
  }

  const sub = subscriptionPill[store.subscriptionStatus];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "My Stores", href: "/admin-portal" },
          { label: store.name },
        ]}
      />
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Store</span>
        <DemoMarker />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
        <StatusPill tone={sub.tone}>Subscription {sub.label}</StatusPill>
      </div>
      <p className="mt-1 text-[15px] text-muted-foreground">
        NCPDP {store.ncpdp} · NPI {store.npi}
      </p>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Members · {members.length}</h2>
        <Button asChild>
          <Link href={`/admin-portal/stores/${storeId}/invite`}>
            Invite member
          </Link>
        </Button>
      </div>
      <div className="mt-4">
        <MemberRoster members={members} onChanged={reload} />
      </div>
    </div>
  );
};

export default StoreDetailScreen;
