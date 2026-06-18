import { redirect } from "next/navigation";

// The Admin Portal surface lands on the Users list (UI_SPEC v1.3 §A.2).
// /admin-portal itself has no content of its own — it forwards to /users.
const AdminPortalIndex = () => {
  redirect("/admin-portal/users");
};

export default AdminPortalIndex;
