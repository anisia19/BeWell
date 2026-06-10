export interface MockReading {
  time: string;
  bpm: number;
  mv: number;
  temp: number;
  hum: number;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const noise = (scale: number) => (Math.random() - 0.5) * scale;

const toTimeString = (d: Date): string => {
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

export const generateInitialMockReadings = (count = 60): MockReading[] => {
  const now = new Date();
  const results: MockReading[] = [];
  let bpm = 72, mv = 0.3, temp = 36.6, hum = 48;

  for (let i = 0; i < count; i++) {
    const t = new Date(now.getTime() - (count - 1 - i) * 5000);
    bpm = clamp(bpm + noise(4), 55, 105);
    mv = clamp(mv + noise(0.15), -0.5, 1.5);
    temp = clamp(temp + noise(0.08), 35.5, 38.0);
    hum = clamp(hum + noise(2), 30, 70);
    results.push({
      time: toTimeString(t),
      bpm: Math.round(bpm),
      mv: parseFloat(mv.toFixed(3)),
      temp: parseFloat(temp.toFixed(1)),
      hum: Math.round(hum),
    });
  }
  return results;
};

export const generateNextMockReading = (prev: MockReading): MockReading => ({
  time: toTimeString(new Date()),
  bpm: Math.round(clamp(prev.bpm + noise(4), 55, 105)),
  mv: parseFloat(clamp(prev.mv + noise(0.15), -0.5, 1.5).toFixed(3)),
  temp: parseFloat(clamp(prev.temp + noise(0.08), 35.5, 38.0).toFixed(1)),
  hum: Math.round(clamp(prev.hum + noise(2), 30, 70)),
});
