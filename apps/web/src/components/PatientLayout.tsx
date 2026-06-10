import { useEffect, useState } from "react";
import { Grid, GridItem, Text, VStack, Stack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";
import SideBarProfile from "./SideBarProfile";

const PatientLayout = () => {
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    fetch(`http://localhost:3001/api/alerts/user/${user.id}`)
      .then((res) => res.json())
      .then((data: { status: string }[]) => {
        setAlertsCount(data.filter((a) => a.status === "ACTIVE").length);
      })
      .catch((err) => console.error("Error fetching alert count:", err));
  }, []);

  return (
    <Grid templateColumns="250px 1fr" minH="100vh">
      <GridItem className="sidebar" p={4}>
        <Stack h="100%" justify="space-between">
          <div>
            <Text fontWeight="bold" mb={4} fontSize="xl">
              BeWell
            </Text>

            <VStack align="start" spacing={3} width="100%">
              <NavLink to="/patient/dashboard" className="sidebar-link">
                Dashboard
              </NavLink>

              <NavLink to="/patient/dashboard/alerts" className="sidebar-link">
                <span>Alerts</span>
                {alertsCount > 0 && (
                  <span className="sidebar-badge">{alertsCount}</span>
                )}
              </NavLink>

              <NavLink
                to="/patient/dashboard/recommendations"
                className="sidebar-link"
              >
                Recommendations
              </NavLink>

              <NavLink
                to="/patient/dashboard/settings"
                className="sidebar-link"
              >
                Settings
              </NavLink>
            </VStack>
          </div>

          <SideBarProfile />
        </Stack>
      </GridItem>

      <GridItem bg="gray.50" p={6} minW="0" h="100vh" overflowY="auto">
        <Outlet />
      </GridItem>
    </Grid>
  );
};

export default PatientLayout;
