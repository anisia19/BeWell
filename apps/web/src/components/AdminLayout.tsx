import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#f8fafc",
      }}
    >
      <h1>Admin Dashboard</h1>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
