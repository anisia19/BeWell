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
        <ActivityIndicator size="large" color="#F44336" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🔔 Alerte și avertizări</Text>

      {alerts.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Nu există alerte active.</Text>
        </View>
      ) : (
        alerts.map((alert, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              selectedAlert?.id === alert.id && styles.cardSelected,
            ]}
            onPress={() => setSelectedAlert(alert)}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertType}>{alert.alert_type}</Text>
              <Text style={[
                styles.alertSeverity,
                alert.severity === 'HIGH' ? styles.high :
                alert.severity === 'MEDIUM' ? styles.medium : styles.low
              ]}>
                {alert.severity}
              </Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertDate}>
              🕐 {new Date(alert.triggered_at).toLocaleString('ro-RO')}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {selectedAlert && (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>
            📝 Adaugă notă pentru alerta selectată
          </Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Introdu o notă asociată alertei..."
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
    color: '#F44336',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  alertType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  high: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  medium: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  low: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  alertMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  alertDate: {
    fontSize: 12,
    color: '#aaa',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});