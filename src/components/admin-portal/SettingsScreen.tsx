"use client";

import { useCallback, useEffect, useState } from "react";
import { Store } from "lucide-react";
import ScreenHeader from "@/components/admin-portal/ScreenHeader";
import SettingsForm from "@/components/admin-portal/SettingsForm";
import EmptyState from "@/components/common/EmptyState";
import { ownerStoresService, settingsService } from "@/services/adminDemo";
import type { PharmacySettings } from "@/types/adminDemo";

const Skeleton = () => (
  <div className="w-full max-w-[560px] space-y-5" data-testid="settings-skeleton">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 bg-muted animate-pulse" />
    ))}
  </div>
);

// V1 simplification: the nav has a single Settings page but settings are
// per-store. We load the owner's FIRST store. (Phase 7: a store picker, or
// settings reached from store detail.)
const SettingsScreen = () => {
  const [settings, setSettings] = useState<PharmacySettings | null>(null);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const stores = await ownerStoresService.listMyStores();
        if (stores.length === 0) {
          if (!cancelled) {
            setEmpty(true);
            setLoading(false);
          }
          return;
        }
        const s = await settingsService.getSettings(stores[0].storeId);
        if (!cancelled) {
          setSettings(s);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load settings");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="mx-auto max-w-[560px]">
      <ScreenHeader
        title="Pharmacy settings"
        subtitle="Update your pharmacy information."
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
      ) : empty ? (
        <div className="mt-6">
          <EmptyState
            icon={<Store className="h-10 w-10" />}
            headline="No stores yet"
            subcopy="Add a store from Billing to manage its settings."
          />
        </div>
      ) : (
        <div className="mt-6">
          <SettingsForm key={settings!.storeId} settings={settings!} />
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
