import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Icon,
  Box,
} from "@chakra-ui/react";
import { FiActivity } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data reflecting the curve in your image
const chartData = [
  { date: "Apr 29", bpm: 64 },
  { date: "Apr 29", bpm: 74 },
  { date: "Apr 29", bpm: 82 },
  { date: "Apr 30", bpm: 88 },
  { date: "Apr 30", bpm: 77 },
  { date: "Apr 30", bpm: 67 },
  { date: "May 1", bpm: 58 },
  { date: "May 1", bpm: 62 },
  { date: "May 1", bpm: 60 },
  { date: "May 2", bpm: 72 },
  { date: "May 2", bpm: 77 },
  { date: "May 3", bpm: 84 },
  { date: "May 3", bpm: 79 },
  { date: "May 3", bpm: 74 },
];

const PatientGraph = () => {
  return (
    <Card
      variant="outline"
      borderRadius="xl"
      w="100%"
      maxW="800px"
      boxShadow="sm"
    >
      <CardHeader pb={0}>
        <Flex align="center" gap={2}>
          <Icon as={FiActivity} color="red.500" boxSize={5} />
          <Heading size="md" fontWeight="600" color="gray.800">
            Heart Rate
          </Heading>
        </Flex>
      </CardHeader>

      <CardBody>
        {/* The Box constraints ensure the ResponsiveContainer knows how large to be */}
        <Box h="250px" w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
                stroke="#edf2f7" // Chakra's gray.100
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a0aec0", fontSize: 12 }} // Chakra's gray.400
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a0aec0", fontSize: 12 }}
                ticks={[53, 63, 73, 91]} // Custom ticks matching your image
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#E53E3E", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="#E53E3E" // Chakra's red.500
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#E53E3E",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
};
export default PatientGraph;
