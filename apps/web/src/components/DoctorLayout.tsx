import { Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const DoctorLayout = () => {
  return (
    <Grid templateColumns="250px 1fr" minH="100vh">
      <GridItem className="sidebar" p={4}>
        <Text fontWeight="bold" mb={4} fontSize="xl">
          BeWell
        </Text>

        <VStack align="start" spacing={3}>
          <NavLink to="/doctor/patients">Patients</NavLink>
          <NavLink to="/doctor/alerts">Alerts</NavLink>
        </VStack>
      </GridItem>

      <GridItem bg="gray.50" p={6}>
        <Outlet />
      </GridItem>
    </Grid>
  );
};

export default DoctorLayout;
