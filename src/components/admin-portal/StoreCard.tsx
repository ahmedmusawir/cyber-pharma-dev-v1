import Link from "next/link";
import StatusPill from "@/components/admin-portal/StatusPill";
import {
  storeStatusPill,
  subscriptionPill,
} from "@/components/admin-portal/statusPresentation";
import type { OwnedStore } from "@/types/adminDemo";

// My Stores grid card → links to the store drill-down. Top pill = store-level
// "Active / Needs attention"; footer pill mirrors the subscription.
const StoreCard = ({ store }: { store: OwnedStore }) => {
  const top = storeStatusPill(store);
  const sub = subscriptionPill[store.subscriptionStatus];

  return (
    <Link
      href={`/admin-portal/stores/${store.storeId}`}
      className="block bg-card border border-border p-[18px] transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="text-[17px] font-semibold tracking-tight">{store.name}</h3>
        <StatusPill tone={top.tone}>{top.label}</StatusPill>
      </div>
      <p className="mt-[7px] text-[13px] text-muted-foreground">
        NCPDP {store.ncpdp} · {store.memberCount}{" "}
        {store.memberCount === 1 ? "member" : "members"}
      </p>
      <hr className="my-3.5 border-border" />
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">Subscription</span>
        <StatusPill tone={sub.tone}>{sub.label}</StatusPill>
      </div>
    </Link>
  );
};

export default StoreCard;
