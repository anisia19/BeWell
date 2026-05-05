import { Card, CardHeader, CardBody, Heading, Box } from "@chakra-ui/react";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import { heartRateData } from "../data/heartRateData";

const muiTheme = createTheme();

const PatientGraph = () => {
  return (
    <Card maxW="800px" borderRadius="xl" boxShadow="sm" w="100%">
      <CardHeader pb={0}>
        <Heading size="md">Heart Rate</Heading>
      </CardHeader>

      <CardBody>
        <Box h="250px" w="100%">
          <ThemeProvider theme={muiTheme}>
            <LineChart
              height={250}
              xAxis={[
                {
                  scaleType: "point",
                  data: heartRateData.map((item) => item.time),
                },
              ]}
              yAxis={[
                {
                  min: 50,
                  max: 100,
                },
              ]}
              series={[
                {
                  data: heartRateData.map((item) => item.bpm),
                  color: "#E53E3E",
                  curve: "monotoneX",
                  showMark: true,
                },
              ]}
              margin={{ top: 20, right: 20, left: 40, bottom: 35 }}
            />
          </ThemeProvider>
        </Box>
      </CardBody>
    </Card>
  );
};

export default PatientGraph;
