import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import useAccelerometer from '../hooks/useAccelerometer';
import useBluetooth from '../hooks/useBluetooth';
import { getPatientProfile } from '../services/api';

export default function HomeScreen({ onLogout }) {
  const [isOnline] = useState(true);
  const [alertRules, setAlertRules] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const profile = await getPatientProfile();
      setPatientName(`${profile.first_name} ${profile.last_name}`);
      setAlertRules([
        { parameter: 'pulse', min: parseFloat(profile.normal_pulse_min), max: parseFloat(profile.normal_pulse_max) },
        { parameter: 'temperature', min: parseFloat(profile.normal_temperature_min), max: parseFloat(profile.normal_temperature_max) },
        { parameter: 'ecg', min: parseFloat(profile.normal_ecg_min), max: parseFloat(profile.normal_ecg_max) },
        { parameter: 'humidity', min: parseFloat(profile.normal_humidity_min), max: parseFloat(profile.normal_humidity_max) },
      ]);
    } catch (error) {
      setAlertRules([
        { parameter: 'pulse', min: 60, max: 100 },
        { parameter: 'temperature', min: 36, max: 37.5 },
        { parameter: 'ecg', min: 60, max: 100 },
        { parameter: 'humidity', min: 30, max: 60 },
      ]);
    } finally {
      setLoadingProfile(false);
    }
  };

  const { data: accelData, isActive } = useAccelerometer(isOnline);
  const {
    isScanning, connectedDevice, foundDevices, sensorData, alerts,
    startScanning, stopScanning, disconnectDevice,
  } = useBluetooth(isOnline, alertRules);

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6EE7B7" />
        <Text style={styles.loadingText}>Se încarcă profilul...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bună ziua,</Text>
            <Text style={styles.name}>{patientName || 'Pacient'}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Ieșire</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.pill, connectedDevice ? styles.pillOn : styles.pillOff]}>
            <Text style={[styles.pillText, connectedDevice ? styles.pillTextOn : styles.pillTextOff]}>
              {connectedDevice ? 'BLE activ' : 'BLE inactiv'}
            </Text>
          </View>
          <View style={[styles.pill, isOnline ? styles.pillOn : styles.pillOff]}>
            <Text style={[styles.pillText, isOnline ? styles.pillTextOn : styles.pillTextOff]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={[styles.pill, isActive ? styles.pillOn : styles.pillOff]}>
            <Text style={[styles.pillText, isActive ? styles.pillTextOn : styles.pillTextOff]}>
              Accel. {isActive ? 'activ' : 'inactiv'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.waveCard}>
        <Text style={styles.waveLabel}>Puls curent</Text>
        <Text style={styles.waveVal}>
          {sensorData.pulse ? sensorData.pulse.toFixed(0) : '--'}
          <Text style={styles.waveUnit}> bpm</Text>
        </Text>
        <View style={styles.wavePlaceholder}>
          <Text style={styles.wavePlaceholderText}>
            {connectedDevice ? '~ ECG live ~' : 'Conectează BLE pentru date live'}
          </Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <View style={[styles.metricCard, sensorData.temperature > 37.5 && styles.metricCardWarn]}>
          <Text style={styles.metricVal}>
            {sensorData.temperature ? sensorData.temperature.toFixed(1) : '--'}
          </Text>
          <Text style={styles.metricLbl}>Temperatură °C</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>
            {sensorData.humidity ? sensorData.humidity.toFixed(0) : '--'}%
          </Text>
          <Text style={styles.metricLbl}>Umiditate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>
            {sensorData.ecg ? sensorData.ecg.toFixed(0) : '--'}
          </Text>
          <Text style={styles.metricLbl}>ECG</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{accelData.z.toFixed(2)}</Text>
          <Text style={styles.metricLbl}>Accel. Z</Text>
        </View>
      </View>

      <View style={styles.btCard}>
        {!connectedDevice ? (
          <TouchableOpacity
            style={[styles.btButton, isScanning && styles.btButtonScanning]}
            onPress={isScanning ? stopScanning : startScanning}
          >
            <Text style={styles.btButtonText}>
              {isScanning ? 'Scanare... (Oprește)' : 'Conectează Bluetooth'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btButtonDisconnect} onPress={disconnectDevice}>
            <Text style={styles.btButtonText}>Deconectează</Text>
          </TouchableOpacity>
        )}
        {foundDevices.length > 0 && (
          <View style={styles.devicesContainer}>
            <Text style={styles.devicesTitle}>Dispozitive găsite:</Text>
            {foundDevices.map((d, i) => (
              <Text key={i} style={styles.deviceItem}>• {d.name}</Text>
            ))}
          </View>
        )}
        {isScanning && foundDevices.length === 0 && (
          <Text style={styles.scanningText}>Căutare dispozitive BeWell...</Text>
        )}
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Alerte active</Text>
          {alerts.slice(0, 3).map((alert, i) => (
            <Text key={i} style={styles.alertText}>• {alert.message}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  loadingText: { color: '#6EE7B7', marginTop: 12, fontSize: 14 },
  header: { backgroundColor: '#1A3A2A', padding: 20, paddingTop: 52, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  greeting: { fontSize: 12, color: '#6EE7B7' },
  name: { fontSize: 20, fontWeight: '500', color: 'white', marginTop: 2 },
  logoutButton: { backgroundColor: '#1F2937', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#6B7280', fontSize: 12 },
  statusRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pillOn: { backgroundColor: '#065F46' },
  pillOff: { backgroundColor: '#1F2937' },
  pillText: { fontSize: 10 },
  pillTextOn: { color: '#6EE7B7' },
  pillTextOff: { color: '#6B7280' },
  waveCard: { marginHorizontal: 12, marginBottom: 10, backgroundColor: '#161B22', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#21262D' },
  waveLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  waveVal: { fontSize: 32, fontWeight: '500', color: '#58A6FF' },
  waveUnit: { fontSize: 14, color: '#6B7280' },
  wavePlaceholder: { marginTop: 8, height: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#21262D', borderRadius: 8 },
  wavePlaceholderText: { fontSize: 10, color: '#4B5563' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 2 },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: '#161B22', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#21262D' },
  metricCardWarn: { borderColor: '#6E3535', backgroundColor: '#1A1010' },
  metricVal: { fontSize: 22, fontWeight: '500', color: '#6EE7B7', marginBottom: 4 },
  metricLbl: { fontSize: 10, color: '#6B7280' },
  btCard: { marginHorizontal: 12, marginTop: 10, marginBottom: 10, backgroundColor: '#161B22', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#21262D' },
  btButton: { backgroundColor: '#064E3B', borderRadius: 10, padding: 12, alignItems: 'center' },
  btButtonScanning: { backgroundColor: '#7C2D12' },
  btButtonDisconnect: { backgroundColor: '#450A0A', borderRadius: 10, padding: 12, alignItems: 'center' },
  btButtonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 14 },
  devicesContainer: { marginTop: 10 },
  devicesTitle: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  deviceItem: { fontSize: 11, color: '#58A6FF', marginBottom: 2 },
  scanningText: { fontSize: 11, color: '#F59E0B', textAlign: 'center', marginTop: 8 },
  alertCard: { marginHorizontal: 12, marginBottom: 10, backgroundColor: '#1A0A0A', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#6E3535' },
  alertTitle: { fontSize: 12, color: '#FCA5A5', fontWeight: '500', marginBottom: 6 },
  alertText: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
});