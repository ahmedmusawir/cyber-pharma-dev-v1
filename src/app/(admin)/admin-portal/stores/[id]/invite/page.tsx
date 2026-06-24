import InviteScreen from "@/components/admin-portal/InviteScreen";

const InviteMemberPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <InviteScreen storeId={id} />;
};

export default InviteMemberPage;
