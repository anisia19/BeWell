import { Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <Grid templateColumns="250px 1fr" minH="100vh">
      <GridItem bg="teal.500" color="white" p={4}>
        <Text fontWeight="bold" mb={4} fontSize="xl">
          BeWell
        </Text>

        <VStack align="start" spacing={3}>
          <Link to="/">Dashboard</Link>
          <Link to="/patients">Patients</Link>
          <Link to="/doctor">Doctor</Link>
        </VStack>
      </GridItem>

      <GridItem bg="gray.50" p={6}>
        <Outlet />
      </GridItem>
    </Grid>
  );
}

export default Layout;
