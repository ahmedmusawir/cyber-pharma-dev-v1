import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/get-user-role";
import { AppRole } from "@/utils/app-role";
import ProfileForm from "./ProfileForm";

const ProfilePage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Canonical role from user_roles (not metadata) drives the profile badge.
  const role = (await getUserRole(user.id)) ?? AppRole.MEMBER;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <ProfileForm user={user} role={role} />
    </div>
  );
};

export default ProfilePage;
