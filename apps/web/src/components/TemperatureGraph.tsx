import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon } from "@chakra-ui/react";
import { FaThermometerHalf } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { temperatureData } from "../data/temperatureData";

const muiTheme = createTheme();

const TemperatureGraph = () => {
  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="orange.50" borderRadius="lg" color="orange.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaThermometerHalf} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Temperature</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>Celsius (°C) over time</Text>
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
                  data: temperatureData.map((item) => item.time),
                },
              ]}
              yAxis={[
                {
                  min: 35, // Minim 35 grade
                  max: 40, // Maxim 40 grade
                },
              ]}
              series={[
                {
                  data: temperatureData.map((item) => item.temp),
                  color: "#DD6B20", // Portocaliu
                  curve: "monotoneX",
                  showMark: true,
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

export default TemperatureGraph;