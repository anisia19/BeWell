import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import useAccelerometer from '../hooks/useAccelerometer';

export default function HomeScreen() {
  const [isOnline] = useState(true);
  const { data: accelData, isActive } = useAccelerometer(isOnline);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bun venit în BeWell! 👋</Text>
        <Text style={styles.subtitle}>Sistemul tău de monitorizare a sănătății</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Status senzori</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Bluetooth</Text>
          <Text style={styles.statusOff}>● Deconectat</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Internet</Text>
          <Text style={styles.statusOn}>● Conectat</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Accelerometru</Text>
          <Text style={isActive ? styles.statusOn : styles.statusOff}>
            {isActive ? '● Activ' : '● Inactiv'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>❤️ Ultimele măsurători</Text>
        <Text style={styles.measureText}>Puls: -- bpm</Text>
        <Text style={styles.measureText}>Temperatură: -- °C</Text>
        <Text style={styles.measureText}>Umiditate: -- %</Text>
        <Text style={styles.measureText}>ECG: --</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📱 Accelerometru</Text>
        <Text style={styles.measureText}>X: {accelData.x.toFixed(4)}</Text>
        <Text style={styles.measureText}>Y: {accelData.y.toFixed(4)}</Text>
        <Text style={styles.measureText}>Z: {accelData.z.toFixed(4)}</Text>
        <Text style={styles.hint}>
          📤 Date trimise la cloud la fiecare 30s (burst)
        </Text>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#555',
  },
  statusOn: {
    fontSize: 14,
    color: 'green',
  },
  statusOff: {
    fontSize: 14,
    color: 'red',
  },
  measureText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
  },
});