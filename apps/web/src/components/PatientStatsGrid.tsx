import { SimpleGrid } from "@chakra-ui/react";
import { FaHeartbeat, FaWaveSquare, FaThermometerHalf, FaTint } from "react-icons/fa";
import SummaryCard from "./SummaryCard";
import type { SensorReading } from "../hooks/useSensorReadings";
import { classifyVital } from "../utils/vitalsClassifier";

interface Props {
  latest?: SensorReading | null;
  loading?: boolean;
  isMock?: boolean;
}

const PatientStatsGrid = ({ latest, loading, isMock = false }: Props) => {
  const pulse = latest ? Math.round(Number(latest.pulseValue)) : null;
  const ecg = latest ? Number(Number(latest.ecgValue).toFixed(2)) : null;
  const temp = latest ? Number(Number(latest.temperatureValue).toFixed(1)) : null;
  const hum = latest ? Math.round(Number(latest.humidityValue)) : null;

  const noDataLabel = loading ? "Loading..." : isMock ? "Demo data" : "No data";

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8} w="100%">
      <SummaryCard
        label="Avg. Heart Rate"
        value={pulse ?? "—"}
        unit="BPM"
        icon={FaHeartbeat}
        colorScheme="red"
        statusLabel={noDataLabel}
        vitalStatus={pulse !== null ? classifyVital("bpm", pulse) : undefined}
      />
      <SummaryCard
        label="ECG Amplitude"
        value={ecg ?? "—"}
        unit="mV"
        icon={FaWaveSquare}
        colorScheme="green"
        statusLabel={noDataLabel}
        vitalStatus={ecg !== null ? classifyVital("ecgMv", ecg) : undefined}
      />
      <SummaryCard
        label="Body Temperature"
        value={temp ?? "—"}
        unit="°C"
        icon={FaThermometerHalf}
        colorScheme="orange"
        statusLabel={noDataLabel}
        vitalStatus={temp !== null ? classifyVital("tempC", temp) : undefined}
      />
      <SummaryCard
        label="Ambient Humidity"
        value={hum ?? "—"}
        unit="%"
        icon={FaTint}
        colorScheme="teal"
        statusLabel={noDataLabel}
        vitalStatus={hum !== null ? classifyVital("humPercent", hum) : undefined}
      />
    </SimpleGrid>
  );
};

export default PatientStatsGrid;
