import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2196F3' },
};

export default function ChartsScreen({ sensorHistory }) {
  const [loading, setLoading] = useState(false);

  const history = sensorHistory || [
    { pulse: 72, temperature: 36.5, humidity: 45, ecg: 75, time: '13:00' },
    { pulse: 75, temperature: 36.7, humidity: 47, ecg: 78, time: '13:10' },
    { pulse: 80, temperature: 36.8, humidity: 46, ecg: 82, time: '13:20' },
    { pulse: 78, temperature: 36.6, humidity: 44, ecg: 79, time: '13:30' },
    { pulse: 74, temperature: 36.5, humidity: 45, ecg: 76, time: '13:40' },
    { pulse: 76, temperature: 36.7, humidity: 46, ecg: 77, time: '13:50' },
  ];

  const labels = history.map(h => h.time);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📈 Grafice parametri fiziologici</Text>

      {/* Puls */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>❤️ Puls (bpm)</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: history.map(h => h.pulse) }],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Temperatură */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>🌡️ Temperatură (°C)</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: history.map(h => h.temperature) }],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Umiditate */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>💧 Umiditate (%)</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: history.map(h => h.humidity) }],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* ECG */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>📊 ECG</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: history.map(h => h.ecg) }],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
});