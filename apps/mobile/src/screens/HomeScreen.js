import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import useAccelerometer from '../hooks/useAccelerometer';
import useBluetooth from '../hooks/useBluetooth';

export default function HomeScreen() {
  const [isOnline] = useState(true);
  const { data: accelData, isActive } = useAccelerometer(isOnline);
  const {
    isScanning,
    connectedDevice,
    foundDevices,
    sensorData,
    alerts,
    startScanning,
    stopScanning,
    disconnectDevice,
  } = useBluetooth(isOnline, [
    { parameter: 'pulse', min: 60, max: 100 },
    { parameter: 'temperature', min: 36, max: 37.5 },
    { parameter: 'ecg', min: 60, max: 100 },
    { parameter: 'humidity', min: 30, max: 60 },
  ]);

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
          <Text style={connectedDevice ? styles.statusOn : styles.statusOff}>
            {connectedDevice ? `● Conectat (${connectedDevice.name})` : '● Deconectat'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Internet</Text>
          <Text style={isOnline ? styles.statusOn : styles.statusOff}>
            {isOnline ? '● Conectat' : '● Deconectat'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Accelerometru</Text>
          <Text style={isActive ? styles.statusOn : styles.statusOff}>
            {isActive ? '● Activ' : '● Inactiv'}
          </Text>
        </View>

        <View style={styles.btButtons}>
          {!connectedDevice ? (
            <TouchableOpacity
              style={[styles.btButton, isScanning && styles.btButtonScanning]}
              onPress={isScanning ? stopScanning : startScanning}
            >
              <Text style={styles.btButtonText}>
                {isScanning ? '🔍 Scanare... (Oprește)' : '🔵 Conectează Bluetooth'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.btButtonDisconnect}
              onPress={disconnectDevice}
            >
              <Text style={styles.btButtonText}>🔴 Deconectează</Text>
            </TouchableOpacity>
          )}
        </View>

        {foundDevices.length > 0 && (
          <View style={styles.devicesContainer}>
            <Text style={styles.devicesTitle}>Dispozitive găsite:</Text>
            {foundDevices.map((d, i) => (
              <Text key={i} style={styles.deviceItem}>• {d.name} ({d.id})</Text>
            ))}
          </View>
        )}

        {isScanning && foundDevices.length === 0 && (
          <Text style={styles.scanningText}>
            Căutare dispozitive BeWell în jur...
          </Text>
        )}

        {!connectedDevice && !isScanning && (
          <Text style={styles.demoText}>
            Caută dispozitive Bluetooth cu numele "BeWell"
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>❤️ Ultimele măsurători</Text>
        <Text style={styles.measureText}>
          Puls: {sensorData.pulse ? `${sensorData.pulse.toFixed(0)} bpm` : '-- bpm'}
        </Text>
        <Text style={styles.measureText}>
          Temperatură: {sensorData.temperature ? `${sensorData.temperature.toFixed(1)} °C` : '-- °C'}
        </Text>
        <Text style={styles.measureText}>
          Umiditate: {sensorData.humidity ? `${sensorData.humidity.toFixed(0)} %` : '-- %'}
        </Text>
        <Text style={styles.measureText}>
          ECG: {sensorData.ecg ? sensorData.ecg.toFixed(0) : '--'}
        </Text>
        {connectedDevice && (
          <Text style={styles.hint}>📤 Medie trimisă la cloud la fiecare 30s</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📱 Accelerometru</Text>
        <Text style={styles.measureText}>X: {accelData.x.toFixed(4)}</Text>
        <Text style={styles.measureText}>Y: {accelData.y.toFixed(4)}</Text>
        <Text style={styles.measureText}>Z: {accelData.z.toFixed(4)}</Text>
        <Text style={styles.hint}>📤 Date trimise la cloud la fiecare 30s (burst)</Text>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🚨 Alerte active!</Text>
          {alerts.slice(0, 3).map((alert, index) => (
            <Text key={index} style={styles.alertText}>• {alert.message}</Text>
          ))}
        </View>
      )}
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
  alertCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
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
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 4,
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
  btButtons: {
    marginTop: 12,
  },
  btButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btButtonScanning: {
    backgroundColor: '#FF9800',
  },
  btButtonDisconnect: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  btButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  devicesContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  devicesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 4,
  },
  deviceItem: {
    fontSize: 13,
    color: '#2196F3',
    marginBottom: 2,
  },
  scanningText: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 8,
  },
  demoText: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 6,
  },
});