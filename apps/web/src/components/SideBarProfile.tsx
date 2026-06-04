import { useNavigate, useLocation } from "react-router-dom";
import "./SidebarProfile.css";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
};

const SideBarProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const rawUser: User | null = storedUser ? JSON.parse(storedUser) : null;
  const user = rawUser
    ? { ...rawUser, name: `${rawUser.firstName} ${rawUser.lastName}` }
    : null;

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  const role = location.pathname.startsWith("/doctor") ? "Doctor" : "Patient";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile-divider" />
      <div className="sidebar-profile-user">
        <div className="sidebar-profile-avatar">{initials}</div>
        <div className="sidebar-profile-info">
          <span className="sidebar-profile-name">{user?.name || "Utilizator"}</span>
          <span className="sidebar-profile-role">{role}</span>
        </div>
      </div>
      <button className="sidebar-profile-logout" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right"></i>
        Log out
      </button>
    </div>
  );
};

export default SideBarProfile;