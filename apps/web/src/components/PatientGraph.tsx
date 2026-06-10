import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon, Flex } from "@chakra-ui/react";
import { FaHeartbeat } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";

const muiTheme = createTheme();

interface Props {
  data?: { time: string; bpm: number }[];
  isMock?: boolean;
}

const PatientGraph = ({ data = [], isMock = false }: Props) => {
  const hasData = data.length > 0;

  const yMin = hasData ? Math.min(...data.map((d) => d.bpm)) - 5 : 40;
  const yMax = hasData ? Math.max(...data.map((d) => d.bpm)) + 5 : 120;

  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="red.50" borderRadius="lg" color="red.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaHeartbeat} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Heart Rate</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Beats per minute (BPM) over time{isMock ? " · Demo data" : ""}
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
                series={[{ data: data.map((d) => d.bpm), color: "#E53E3E", curve: "monotoneX", showMark: false }]}
                margin={{ top: 20, right: 20, left: 45, bottom: 30 }}
              />
            </ThemeProvider>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default PatientGraph;
