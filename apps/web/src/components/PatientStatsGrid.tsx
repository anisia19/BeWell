import { SimpleGrid } from "@chakra-ui/react";
import { 
  FaHeartbeat, 
  FaWaveSquare, 
  FaProjectDiagram, 
  FaChartBar, 
  FaThermometerHalf, 
  FaTint 
} from "react-icons/fa";
import SummaryCard from "./SummaryCard"; // Asigură-te că importul este corect

const PatientStatsGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8} w="100%">
      
      {/* 1. Pentru PatientGraph (Heart Rate) */}
      <SummaryCard 
        label="Avg. Heart Rate" 
        value={74} 
        unit="BPM" 
        icon={FaHeartbeat} 
        colorScheme="red" 
        statusLabel="Normal"
      />

      {/* 2. Pentru LiveECGGraph */}
      <SummaryCard 
        label="ECG Amplitude" 
        value={1.45} 
        unit="mV" 
        icon={FaWaveSquare} 
        colorScheme="green" 
        statusLabel="Stable"
      />

      {/* 3. Pentru PoincarePlotGraph (HRV) */}
      <SummaryCard 
        label="HRV (RMSSD)" 
        value={42} 
        unit="ms" 
        icon={FaProjectDiagram} 
        colorScheme="purple" 
        statusLabel="Good"
      />

      {/* 4. Pentru SpectrogramGraph */}
      <SummaryCard 
        label="LF/HF Ratio" 
        value={1.8} 
        unit="ratio" 
        icon={FaChartBar} 
        colorScheme="orange" 
        statusLabel="Relaxed"
      />

      {/* 5. Pentru TemperatureGraph */}
      <SummaryCard 
        label="Body Temperature" 
        value={36.7} 
        unit="°C" 
        icon={FaThermometerHalf} 
        colorScheme="red" 
        statusLabel="Normal"
      />

      {/* 6. Pentru HumidityGraph */}
      <SummaryCard 
        label="Ambient Humidity" 
        value={45} 
        unit="%" 
        icon={FaTint} 
        colorScheme="teal" 
        statusLabel="Optimal"
      />

    </SimpleGrid>
  );
};

export default PatientStatsGrid;