import { Card, CardHeader, CardBody, Heading, Box, HStack, Text, Icon } from "@chakra-ui/react";
import { FaChartBar } from "react-icons/fa";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { fftData } from "../data/fftData";

const muiTheme = createTheme();

const SpectrogramGraph = () => {
  return (
    <Card maxW="800px" borderRadius="2xl" boxShadow="md" border="1px" borderColor="gray.100" w="100%">
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          <Box p={3} bg="orange.50" borderRadius="lg" color="orange.500" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaChartBar} boxSize={6} />
          </Box>
          <Box>
            <Heading size="md" color="gray.800">Frequency Analysis</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>Power Spectral Density (PSD)</Text>
          </Box>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Box h="280px" w="100%">
          <ThemeProvider theme={muiTheme}>
            <BarChart
              height={280}
              xAxis={[{ 
                scaleType: "band", 
                data: fftData.map(item => item.band)
              }]}
              series={[{ 
                data: fftData.map(item => item.power),
                color: "#DD6B20", // Portocaliu
              }]}
              margin={{ top: 20, right: 20, left: 40, bottom: 30 }}
            />
          </ThemeProvider>
        </Box>
      </CardBody>
    </Card>
  );
};

export default SpectrogramGraph;