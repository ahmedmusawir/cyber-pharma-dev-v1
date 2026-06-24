import StoreDetailScreen from "@/components/admin-portal/StoreDetailScreen";

const StoreDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <StoreDetailScreen storeId={id} />;
};

export default StoreDetailPage;
