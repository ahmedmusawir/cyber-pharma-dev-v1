import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// C4a scaffold — Store detail placeholder. C4b adds the breadcrumb lock, store
// header + status pill, and the member roster (services → store member list).
const StoreDetailPage = () => {
  return (
    <div>
      <ScreenHeader title="Store detail" subtitle="Members, status, and billing for this store." />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default StoreDetailPage;
