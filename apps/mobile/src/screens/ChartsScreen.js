import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;
const API_BASE_URL = 'http://10.48.64.79:3001';

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
        <ActivityIndicator size="large" color="#6EE7B7" />
        <Text style={styles.loadingText}>Se încarcă datele...</Text>
      </View>
    );
  }

  if (error || history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSub}>Evoluție parametri</Text>
          <Text style={styles.headerTitle}>Grafice</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Nu există date încă</Text>
          <Text style={styles.emptySubtitle}>
            Datele vor apărea după ce modulul wearable trimite măsurători.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSensorHistory}>
            <Text style={styles.retryText}>Reîncearcă</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const labels = history.map((h) => {
    const date = new Date(h.recorded_at);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  const chartConfig = {
    backgroundGradientFrom: '#161B22',
    backgroundGradientTo: '#161B22',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(110, 231, 183, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: '3', strokeWidth: '1', stroke: '#6EE7B7' },
    propsForBackgroundLines: { stroke: '#21262D' },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Evoluție parametri</Text>
        <Text style={styles.headerTitle}>Grafice</Text>
      </View>

      <Text style={styles.subheader}>Ultimele {history.length} măsurători</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchSensorHistory}>
        <Text style={styles.refreshText}>Actualizează</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.chartTitle}>Puls (bpm)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: history.map(h => parseFloat(h.pulse) || 0) }] }}
          width={screenWidth}
          height={180}
          chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(248, 113, 113, ${opacity})`, propsForDots: { r: '3', strokeWidth: '1', stroke: '#F87171' } }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.chartTitle}>Temperatură (°C)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: history.map(h => parseFloat(h.temperature) || 0) }] }}
          width={screenWidth}
          height={180}
          chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`, propsForDots: { r: '3', strokeWidth: '1', stroke: '#FBBF24' } }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.chartTitle}>Umiditate (%)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: history.map(h => parseFloat(h.humidity) || 0) }] }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.chartTitle}>ECG</Text>
        <LineChart
          data={{ labels, datasets: [{ data: history.map(h => parseFloat(h.ecg) || 0) }] }}
          width={screenWidth}
          height={180}
          chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`, propsForDots: { r: '3', strokeWidth: '1', stroke: '#58A6FF' } }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  header: { backgroundColor: '#1A3A2A', padding: 20, paddingTop: 52, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 12 },
  headerSub: { fontSize: 12, color: '#6EE7B7' },
  headerTitle: { fontSize: 20, fontWeight: '500', color: 'white', marginTop: 4 },
  subheader: { fontSize: 12, color: '#6B7280', marginHorizontal: 12, marginBottom: 8 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: 'white', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#064E3B', borderRadius: 10, padding: 12, paddingHorizontal: 24 },
  retryText: { color: '#6EE7B7', fontWeight: '500' },
  refreshButton: { backgroundColor: '#161B22', borderRadius: 10, padding: 8, marginHorizontal: 12, alignItems: 'center', marginBottom: 12, borderWidth: 0.5, borderColor: '#21262D' },
  refreshText: { color: '#6EE7B7', fontWeight: '500', fontSize: 13 },
  card: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 14, borderWidth: 0.5, borderColor: '#21262D' },
  chartTitle: { fontSize: 13, fontWeight: '500', color: '#8B949E', marginBottom: 8 },
  chart: { borderRadius: 10, marginLeft: -16 },
});