import OwedBookScreen from "@/components/owedbook/OwedBookScreen";

// Server shell → client island (Phase-1 lesson). The guard lives in the layout;
// all interactivity (tabs, filters, sort, pager, service calls) is in the island.
const OwedBookPage = () => {
  return <OwedBookScreen />;
};

export default OwedBookPage;
