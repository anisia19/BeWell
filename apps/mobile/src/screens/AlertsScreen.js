import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { getAlerts, sendAlertNote } from '../services/api';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Eroare la încărcarea alertelor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNote = async () => {
    if (!selectedAlert || !noteText.trim()) {
      Alert.alert('Eroare', 'Selectează o alertă și introdu un text.');
      return;
    }
    try {
      await sendAlertNote(selectedAlert.id, noteText);
      Alert.alert('Succes', 'Nota a fost trimisă la cloud!');
      setNoteText('');
      setSelectedAlert(null);
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut trimite nota.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6EE7B7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>Monitorizare activă</Text>
        <Text style={styles.headerTitle}>Alerte și avertizări</Text>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nu există alerte active.</Text>
        </View>
      ) : (
        alerts.map((alert, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              selectedAlert?.id === alert.id && styles.cardSelected,
              alert.severity === 'HIGH' && styles.cardHigh,
              alert.severity === 'MEDIUM' && styles.cardMedium,
            ]}
            onPress={() => setSelectedAlert(alert)}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertType}>{alert.alert_type}</Text>
              <View style={[
                styles.severityBadge,
                alert.severity === 'HIGH' ? styles.badgeHigh :
                alert.severity === 'MEDIUM' ? styles.badgeMedium : styles.badgeLow
              ]}>
                <Text style={[
                  styles.severityText,
                  alert.severity === 'HIGH' ? styles.textHigh :
                  alert.severity === 'MEDIUM' ? styles.textMedium : styles.textLow
                ]}>
                  {alert.severity}
                </Text>
              </View>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertDate}>
              {new Date(alert.triggered_at).toLocaleString('ro-RO')}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {selectedAlert && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Adaugă notă pentru alerta selectată</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Introduceți o notă..."
            placeholderTextColor="#4B5563"
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendNote}>
            <Text style={styles.sendButtonText}>Trimite la cloud</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  header: { backgroundColor: '#1A3A2A', padding: 20, paddingTop: 52, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 12 },
  headerSub: { fontSize: 12, color: '#6EE7B7' },
  headerTitle: { fontSize: 20, fontWeight: '500', color: 'white', marginTop: 4 },
  card: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#21262D' },
  cardSelected: { borderColor: '#6EE7B7' },
  cardHigh: { backgroundColor: '#1A0A0A', borderColor: '#6E3535' },
  cardMedium: { backgroundColor: '#1A1200', borderColor: '#6E4C00' },
  emptyCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 20, marginHorizontal: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#21262D' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  alertType: { fontSize: 14, fontWeight: '500', color: 'white' },
  severityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeHigh: { backgroundColor: '#450A0A' },
  badgeMedium: { backgroundColor: '#3D2000' },
  badgeLow: { backgroundColor: '#064E3B' },
  severityText: { fontSize: 11, fontWeight: '500' },
  textHigh: { color: '#FCA5A5' },
  textMedium: { color: '#FCD34D' },
  textLow: { color: '#6EE7B7' },
  alertMessage: { fontSize: 13, color: '#8B949E', marginBottom: 6 },
  alertDate: { fontSize: 11, color: '#4B5563' },
  noteCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#21262D' },
  noteTitle: { fontSize: 13, fontWeight: '500', color: '#6EE7B7', marginBottom: 10 },
  noteInput: { borderWidth: 0.5, borderColor: '#21262D', borderRadius: 10, padding: 10, fontSize: 13, minHeight: 80, textAlignVertical: 'top', marginBottom: 10, color: 'white', backgroundColor: '#0D1117' },
  sendButton: { backgroundColor: '#064E3B', borderRadius: 10, padding: 12, alignItems: 'center' },
  sendButtonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 14 },
});