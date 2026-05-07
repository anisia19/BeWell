import { Grid, GridItem, Text, VStack, Stack, Box } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";
import SideBarProfile from "./SideBarProfile";

const PatientLayout = () => {
  return (
    <Grid templateColumns="250px minmax(0, 1fr)" minH="100vh">
      <GridItem className="sidebar" p={4}>
        <Stack h="100%" justify="space-between">
          <Box>
            <Text fontWeight="bold" mb={4} fontSize="xl">
              BeWell
            </Text>

            <VStack align="start" spacing={3}>
              <NavLink to="/patient/dashboard">Dashboard</NavLink>
              <NavLink to="/patient/dashboard/alerts">Alerts</NavLink>
              <NavLink to="/patient/dashboard/recommendations">
                Recommendations
              </NavLink>
            </VStack>
          </Box>
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
