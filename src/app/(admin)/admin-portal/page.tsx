import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// Phase 2.2 route takeover: /admin-portal IS the My Stores landing (the old
// redirect to /users is gone). C4a scaffold — header-only placeholder so the
// route + shell stand up; C4b replaces the body with the real store grid
// (services → store, skeleton → data → EmptyState).
const MyStoresPage = () => {
  return (
    <div>
      <ScreenHeader
        title="My Stores"
        subtitle="Manage your pharmacies, members, and billing."
      />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default MyStoresPage;
