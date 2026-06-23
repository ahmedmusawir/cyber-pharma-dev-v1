import { redirect } from "next/navigation";

// The Admin Portal surface lands on the Users list (UI_SPEC v1.3 §A.2).
// /moose-portal itself has no content of its own — it forwards to /users.
const AdminPortalIndex = () => {
  redirect("/moose-portal/users");
};

export default AdminPortalIndex;
