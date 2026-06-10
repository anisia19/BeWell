import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon, Flex } from "@chakra-ui/react";
import { FaThermometerHalf } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";

const muiTheme = createTheme();

interface Props {
  data?: { time: string; temp: number }[];
  isMock?: boolean;
}

const TemperatureGraph = ({ data = [], isMock = false }: Props) => {
  const hasData = data.length > 0;

  const values = hasData ? data.map((d) => d.temp) : [];
  const rawMin = hasData ? Math.min(...values) : 35;
  const rawMax = hasData ? Math.max(...values) : 40;
  // Ensure at least 1°C of visible range to prevent extreme zoom-in on flat data
  const range = rawMax - rawMin;
  const pad = range < 1 ? (1 - range) / 2 + 0.2 : rawMax * 0.02;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;

  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="orange.50" borderRadius="lg" color="orange.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaThermometerHalf} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Temperature</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Celsius (°C) over time{isMock ? " · Demo data" : ""}
            </Text>
          </Box>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Box h="280px" w="100%">
          {!hasData ? (
            <Flex h="100%" align="center" justify="center">
              <Text color="gray.400" fontSize="sm">Waiting for data...</Text>
            </Flex>
          ) : (
            <ThemeProvider theme={muiTheme}>
              <LineChart
                height={280}
                xAxis={[{ scaleType: "point", data: data.map((d) => d.time), tickNumber: 6 }]}
                yAxis={[{ min: yMin, max: yMax }]}
                series={[{ data: data.map((d) => d.temp), color: "#DD6B20", curve: "linear", showMark: false }]}
                margin={{ top: 20, right: 20, left: 45, bottom: 30 }}
              />
            </ThemeProvider>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default TemperatureGraph;
