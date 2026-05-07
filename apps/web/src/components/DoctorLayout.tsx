import { Grid, GridItem, Text, VStack, Stack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";
import SideBarProfile from "./SideBarProfile";

const DoctorLayout = () => {
  return (
    <Grid templateColumns="250px 1fr" minH="100vh">
      <GridItem className="sidebar" p={4}>
        <Stack h="100%" justify="space-between">
          <div>
            <Text fontWeight="bold" mb={4} fontSize="xl">
              BeWell
            </Text>

            <VStack align="start" spacing={3}>
              <NavLink to="/doctor/dashboard/patients">Patients</NavLink>
              <NavLink to="/doctor/dashboard/alerts">Alerts</NavLink>
            </VStack>
          </div>

          <SideBarProfile />
        </Stack>
      </GridItem>

      <GridItem p={0}>
        <Outlet />
      </GridItem>

    </Grid>
  );
};

export default DoctorLayout;