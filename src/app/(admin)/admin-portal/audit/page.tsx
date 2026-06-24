import ScreenHeader from "@/components/admin-portal/ScreenHeader";

// C4a scaffold — Audit log placeholder. C4b adds the read-only DataTable
// (Time · Action · Target · Result), Result rendered Done/Failed from the enum.
const AuditPage = () => {
  return (
    <div>
      <ScreenHeader title="Audit log" subtitle="A record of changes across your stores." />
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-24 bg-muted animate-pulse" />
        <div className="h-24 bg-muted animate-pulse" />
      </div>
    </div>
  );
};

export default AuditPage;
