export type VitalStatus = "low" | "normal" | "high" | "critical";

interface Thresholds {
  criticalLow: number;
  low: number;
  high: number;
  criticalHigh: number;
}

const THRESHOLDS: Record<string, Thresholds> = {
  // Heart rate in BPM
  bpm: {
    criticalLow: 40,   // severe bradycardia
    low: 60,           // mild bradycardia
    high: 100,         // tachycardia onset
    criticalHigh: 130, // severe tachycardia
  },
  // ECG amplitude in mV
  ecgMv: {
    criticalLow: -0.5,
    low: 0,
    high: 1.0,
    criticalHigh: 1.5,
  },
  // Body temperature in °C
  tempC: {
    criticalLow: 35.0,  // hypothermia
    low: 36.1,          // below normal
    high: 37.2,         // fever onset
    criticalHigh: 39.0, // high fever
  },
  // Ambient humidity in %
  humPercent: {
    criticalLow: 20,
    low: 30,
    high: 60,
    criticalHigh: 70,
  },
};

export const classifyVital = (
  type: keyof typeof THRESHOLDS,
  value: number
): VitalStatus => {
  const t = THRESHOLDS[type];
  if (value < t.criticalLow || value > t.criticalHigh) return "critical";
  if (value < t.low) return "low";
  if (value > t.high) return "high";
  return "normal";
};

export interface StatusStyle {
  cardBg: string;
  cardBorder: string;
  badgeColorScheme: string;
  badgeVariant: "subtle" | "solid";
  valueColor: string;
  label: string;
}

export const STATUS_STYLES: Record<VitalStatus, StatusStyle> = {
  normal: {
    cardBg: "white",
    cardBorder: "gray.100",
    badgeColorScheme: "green",
    badgeVariant: "subtle",
    valueColor: "gray.800",
    label: "Normal",
  },
  low: {
    cardBg: "blue.50",
    cardBorder: "blue.200",
    badgeColorScheme: "blue",
    badgeVariant: "subtle",
    valueColor: "blue.700",
    label: "Low",
  },
  high: {
    cardBg: "orange.50",
    cardBorder: "orange.200",
    badgeColorScheme: "orange",
    badgeVariant: "subtle",
    valueColor: "orange.700",
    label: "High",
  },
  critical: {
    cardBg: "red.50",
    cardBorder: "red.300",
    badgeColorScheme: "red",
    badgeVariant: "solid",
    valueColor: "red.700",
    label: "Critical",
  },
};
