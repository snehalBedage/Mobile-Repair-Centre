
import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

function RoleLayout() {
  const role = localStorage.getItem("user_role");

  return (
    <DashboardLayout role={role}>
      <Outlet />
    </DashboardLayout>
  );
}

export default RoleLayout;