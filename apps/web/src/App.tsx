import { Grid, GridItem, Text } from "@chakra-ui/react";
import "./App.css";

function App() {
  return (
    <Grid templateColumns="250px 1fr" minH="100vh">
      <GridItem className="sidebar">
        <Text fontWeight="bold" mb={2}>
          BeWell
        </Text>
      </GridItem>
      <GridItem bg="gray.50" p={6}>
        <Text fontWeight="bold" mb={2}>
          Main Content
        </Text>
      </GridItem>
    </Grid>
  );
}

export default App;
