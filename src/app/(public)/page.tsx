import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import HomePageContent from "./HomePageContent";

// Auth-only redirect (UI_SPEC v1.3 §A): authenticated users hitting / are sent
// to their post-login landing; guests keep the public marketing page untouched.
const Home = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/owedbook");

  return <HomePageContent />;
};

export default Home;
