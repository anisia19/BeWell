export type VitalStatus = "low" | "normal" | "high" | "critical";

export interface PatientThresholds {
  normal_ecg_min?: number | null;
  normal_ecg_max?: number | null;
  normal_pulse_min?: number | null;
  normal_pulse_max?: number | null;
  normal_temperature_min?: number | null;
  normal_temperature_max?: number | null;
  normal_humidity_min?: number | null;
  normal_humidity_max?: number | null;
}

interface DefaultThresholds {
  criticalLow: number;
  low: number;
  high: number;
  criticalHigh: number;
}

const DEFAULTS: Record<string, DefaultThresholds> = {
  bpm:        { criticalLow: 40,   low: 60,   high: 100,  criticalHigh: 130 },
  ecgMv:      { criticalLow: -0.5, low: 0,    high: 1.0,  criticalHigh: 1.5 },
  tempC:      { criticalLow: 35.0, low: 36.1, high: 37.2, criticalHigh: 39.0 },
  humPercent: { criticalLow: 20,   low: 30,   high: 60,   criticalHigh: 70 },
};

const resolveNormalRange = (
  type: "bpm" | "ecgMv" | "tempC" | "humPercent",
  thresholds?: PatientThresholds
): { normalMin: number; normalMax: number; hasCustom: boolean } => {
  const d = DEFAULTS[type];
  let rawMin: number | null | undefined;
  let rawMax: number | null | undefined;

  if (thresholds) {
    if (type === "bpm")        { rawMin = thresholds.normal_pulse_min;       rawMax = thresholds.normal_pulse_max; }
    else if (type === "ecgMv") { rawMin = thresholds.normal_ecg_min;         rawMax = thresholds.normal_ecg_max; }
    else if (type === "tempC") { rawMin = thresholds.normal_temperature_min; rawMax = thresholds.normal_temperature_max; }
    else                       { rawMin = thresholds.normal_humidity_min;    rawMax = thresholds.normal_humidity_max; }
  }

  const hasMin = rawMin != null && rawMin !== "";
  const hasMax = rawMax != null && rawMax !== "";

  if (hasMin || hasMax) {
    return {
      normalMin: hasMin ? Number(rawMin) : d.low,
      normalMax: hasMax ? Number(rawMax) : d.high,
      hasCustom: true,
    };
  }
  return { normalMin: d.low, normalMax: d.high, hasCustom: false };
};

export const classifyVital = (
  type: "bpm" | "ecgMv" | "tempC" | "humPercent",
  value: number,
  thresholds?: PatientThresholds
): VitalStatus => {
  const d = DEFAULTS[type];
  const { normalMin, normalMax, hasCustom } = resolveNormalRange(type, thresholds);

  let criticalLow: number;
  let criticalHigh: number;

  if (hasCustom) {
    // Critical zone = outside the normal range by more than the full width of the normal range
    const range = Math.max(normalMax - normalMin, 0);
    criticalLow  = normalMin - range;
    criticalHigh = normalMax + range;
  } else {
    criticalLow  = d.criticalLow;
    criticalHigh = d.criticalHigh;
  }

  if (value < criticalLow || value > criticalHigh) return "critical";
  if (value < normalMin) return "low";
  if (value > normalMax) return "high";
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
