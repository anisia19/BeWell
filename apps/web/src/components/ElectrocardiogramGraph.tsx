import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon } from "@chakra-ui/react";
import { FaWaveSquare } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { ecgData } from "../data/ecgData";

const muiTheme = createTheme();

const LiveECGGraph = () => {
  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="green.50" borderRadius="lg" color="green.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaWaveSquare} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Live ECG</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>Voltage (mV) over time (ms)</Text>
          </Box>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Box h="280px" w="100%">
          <ThemeProvider theme={muiTheme}>
            <LineChart
              height={280}
              xAxis={[{ data: ecgData.map((item) => item.time), valueFormatter: (v : number) => `${v}ms` }]}
              yAxis={[{ min: -0.5, max: 2.0 }]}
              series={[{
                data: ecgData.map((item) => item.mv),
                color: "#38A169", // Verde pentru semnalul live
                curve: "linear", // Linii drepte, esențiale pentru EKG
                showMark: false, // Fără puncte, doar traseul
              }]}
              margin={{ top: 20, right: 20, left: 40, bottom: 30 }}
            />
          </ThemeProvider>
        </Box>
      </CardBody>
    </Card>
  );
};

export default LiveECGGraph;