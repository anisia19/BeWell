import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  strokeWidth: 2,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2196F3' },
};

const API_BASE_URL = 'http://10.234.21.79:3001';

export default function ChartsScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSensorHistory();
  }, []);

  const fetchSensorHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sensor-readings/1`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      setHistory(data.slice(0, 10).reverse());
    } catch (error) {
      console.error('Eroare grafice:', error);
      setError('Nu s-au putut încărca datele.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Se încarcă datele...</Text>
      </View>
    );
  }

  if (error || history.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>📊</Text>
        <Text style={styles.emptyTitle}>Nu există date încă</Text>
        <Text style={styles.emptySubtitle}>
          Datele vor apărea după ce modulul wearable trimite măsurători.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSensorHistory}>
          <Text style={styles.retryText}>Reîncearcă</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const labels = history.map((h, i) => {
    const date = new Date(h.recorded_at);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  const pulseData = history.map(h => parseFloat(h.pulse) || 0);
  const tempData = history.map(h => parseFloat(h.temperature) || 0);
  const humidityData = history.map(h => parseFloat(h.humidity) || 0);
  const ecgData = history.map(h => parseFloat(h.ecg) || 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📈 Grafice parametri fiziologici</Text>
      <Text style={styles.subheader}>Ultimele {history.length} măsurători</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchSensorHistory}>
        <Text style={styles.refreshText}>🔄 Actualizează</Text>
      </TouchableOpacity>

      {/* Puls */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>❤️ Puls (bpm)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: pulseData }] }}
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
          data={{ labels, datasets: [{ data: tempData }] }}
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
          data={{ labels, datasets: [{ data: humidityData }] }}
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
          data={{ labels, datasets: [{ data: ecgData }] }}
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
    padding: 32,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 13,
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