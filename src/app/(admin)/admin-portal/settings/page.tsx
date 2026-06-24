import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// C4a scaffold — Settings placeholder. C4b adds SettingsForm (pharmacy name,
// contact, phone, address, software) wired through the settings service.
const SettingsPage = () => {
  return (
    <div>
      <ScreenHeader title="Settings" subtitle="Pharmacy profile and contact details." />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default SettingsPage;
