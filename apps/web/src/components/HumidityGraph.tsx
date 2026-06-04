import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon } from "@chakra-ui/react";
import { FaTint } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { humidityData } from "../data/humidityData";

const muiTheme = createTheme();

const HumidityGraph = () => {
  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="teal.50" borderRadius="lg" color="teal.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaTint} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Humidity</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>Percentage (%) over time</Text>
          </Box>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Box h="280px" w="100%">
          <ThemeProvider theme={muiTheme}>
            <LineChart
              height={280}
              xAxis={[
                {
                  scaleType: "point",
                  data: humidityData.map((item) => item.time),
                },
              ]}
              yAxis={[
                {
                  min: 20,
                  max: 80,
                },
              ]}
              series={[
                {
                  data: humidityData.map((item) => item.hum),
                  color: "#319795", // Turcoaz (Teal)
                  curve: "monotoneX",
                  showMark: true,
                  area: true, // Am lăsat area activat aici, arată bine ca "val de apă" pentru umiditate, dar o poți șterge dacă vrei
                },
              ]}
              margin={{ top: 20, right: 20, left: 40, bottom: 30 }}
            />
          </ThemeProvider>
        </Box>
      </CardBody>
    </Card>
  );
};

export default HumidityGraph;