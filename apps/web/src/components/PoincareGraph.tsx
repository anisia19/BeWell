import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon } from "@chakra-ui/react";
import { FaProjectDiagram } from "react-icons/fa"; // Iconiță potrivită pentru nor de puncte
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { poincareData } from "../data/poincareData";

const muiTheme = createTheme();

const PoincarePlotGraph = () => {
  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="purple.50" borderRadius="lg" color="purple.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaProjectDiagram} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">HRV (Poincaré Plot)</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>RRn vs RRn+1 intervals (ms)</Text>
          </Box>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Box h="280px" w="100%">
          <ThemeProvider theme={muiTheme}>
            <ScatterChart
              height={280}
              xAxis={[{ min: 750, max: 850, label: 'RRn (ms)' }]}
              yAxis={[{ min: 750, max: 850, label: 'RRn+1 (ms)' }]}
              series={[{
                data: poincareData,
                color: "#805AD5", // Mov
              }]}
              margin={{ top: 20, right: 20, left: 50, bottom: 50 }}
            />
          </ThemeProvider>
        </Box>
      </CardBody>
    </Card>
  );
};

export default PoincarePlotGraph;