import { Avatar, Text, Button, HStack, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./SidebarProfile.css";

type User = {
  name: string;
  email: string;
  avatar?: string;
  role: "DOCTOR" | "PATIENT" | "ADMIN";
};

const user: User = {
  name: "a",
  email: "a@bewell.com",
  avatar: "",
  role: "PATIENT",
};

const SideBarProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile-divider" />

      <HStack spacing={3} mb={4}>
        <Avatar name={user.name} size="sm" bg="teal.600" />

        <Stack spacing={0}>
          <Text className="sidebar-profile-name">{user.name}</Text>
          <Text className="sidebar-profile-role">
            {user.role.toLowerCase()}
          </Text>
        </Stack>
      </HStack>

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="sidebar-profile-logout"
      >
        <i className="bi bi-box-arrow-right"></i>
        Log out
      </Button>
    </div>
  );
};

export default SideBarProfile;
