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
              <NavLink to="/doctor/patients">Patients</NavLink>
              <NavLink to="/doctor/alerts">Alerts</NavLink>
            </VStack>
          </div>
          <SideBarProfile />
        </Stack>
      </GridItem>

      <GridItem bg="gray.50" p={6}>
        <Outlet />
      </GridItem>
    </Grid>
  );
};

export default DoctorLayout;
