import { 
  Card, 
  CardHeader, 
  CardBody, 
  Heading, 
  Box, 
  HStack, 
  Text, 
  Icon 
} from "@chakra-ui/react";
import { FaHeartbeat } from "react-icons/fa";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { heartRateData } from "../data/heartRateData";

const muiTheme = createTheme();

const PatientGraph = () => {
  return (
    <Card 
      maxW="800px" 
      borderRadius="2xl" 
      boxShadow="md" 
      border="1px" 
      borderColor="gray.100" 
      w="100%"
    >
      <CardHeader pb={2}>
        <HStack spacing={4} alignItems="center">
          {/* Container pentru Iconiță */}
          <Box 
            p={3} 
            bg="red.50" 
            borderRadius="lg" 
            color="red.500" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Icon as={FaHeartbeat} boxSize={6} />
          </Box>
          
          {/* Titlu și Subtitlu */}
          <Box>
            <Heading size="md" color="gray.800">
              Heart Rate
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Beats per minute (BPM) over time
            </Text>
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
                  data: heartRateData.map((item) => item.time),
                },
              ]}
              yAxis={[
                {
                  min: 40, // Lărgit puțin intervalul pentru ca linia să nu atingă marginile
                  max: 120,
                },
              ]}
              series={[
                {
                  data: heartRateData.map((item) => item.bpm),
                  color: "#E53E3E",
                  curve: "monotoneX",
                  showMark: true,
                  //area: true, // Adaugă un fundal colorat sub linia graficului
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

export default PatientGraph;
