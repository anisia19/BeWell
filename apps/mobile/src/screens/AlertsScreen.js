import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { getAlerts, sendAlertNote, deleteAlertNote } from '../services/api';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sending, setSending] = useState(false);

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
    setSending(true);
    try {
      await sendAlertNote(selectedAlert.id, noteText);
      setNoteText('');
      await fetchAlerts();
      setSelectedAlert(null);
      Alert.alert('Succes', 'Nota a fost trimisă!');
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut trimite nota.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Șterge nota',
      'Ești sigur că vrei să ștergi această notă?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlertNote(noteId);
              await fetchAlerts();
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut șterge nota.');
            }
          },
        },
      ]
    );
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
          <View key={index}>
            <TouchableOpacity
              style={[
                styles.card,
                selectedAlert?.id === alert.id && styles.cardSelected,
                alert.severity === 'HIGH' && styles.cardHigh,
                alert.severity === 'MEDIUM' && styles.cardMedium,
              ]}
              onPress={() => setSelectedAlert(
                selectedAlert?.id === alert.id ? null : alert
              )}
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

              {alert.notes && alert.notes.length > 0 && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Note ({alert.notes.length}):</Text>
                  {alert.notes.map((note, ni) => (
                    <View key={ni} style={styles.noteItem}>
                      <View style={styles.noteItemHeader}>
                        <Text style={styles.noteText}>{note.note_text}</Text>
                        <TouchableOpacity
                          style={styles.deleteNoteButton}
                          onPress={() => handleDeleteNote(note.id)}
                        >
                          <Text style={styles.deleteNoteText}>Șterge</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.noteDate}>
                        {new Date(note.created_at).toLocaleString('ro-RO')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.tapHint}>
                {selectedAlert?.id === alert.id ? 'Apasă pentru a închide' : 'Apasă pentru a adăuga notă'}
              </Text>
            </TouchableOpacity>

            {selectedAlert?.id === alert.id && (
              <View style={styles.noteCard}>
                <Text style={styles.noteFormTitle}>Adaugă notă</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Introduceți o notă..."
                  placeholderTextColor="#4B5563"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  autoFocus
                />
                <View style={styles.noteButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setSelectedAlert(null);
                      setNoteText('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Anulează</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                    onPress={handleSendNote}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#6EE7B7" />
                    ) : (
                      <Text style={styles.sendButtonText}>Trimite</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))
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
  card: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 4, borderWidth: 0.5, borderColor: '#21262D' },
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
  tapHint: { fontSize: 10, color: '#374151', marginTop: 8, textAlign: 'right' },
  notesContainer: { marginTop: 10, borderTopWidth: 0.5, borderTopColor: '#21262D', paddingTop: 8 },
  notesTitle: { fontSize: 11, color: '#6EE7B7', marginBottom: 6, fontWeight: '500' },
  noteItem: { backgroundColor: '#0D1117', borderRadius: 8, padding: 8, marginBottom: 6, borderWidth: 0.5, borderColor: '#21262D' },
  noteItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  noteText: { fontSize: 12, color: '#8B949E', flex: 1, marginRight: 8 },
  deleteNoteButton: { backgroundColor: '#450A0A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  deleteNoteText: { fontSize: 10, color: '#FCA5A5' },
  noteDate: { fontSize: 10, color: '#4B5563', marginTop: 4 },
  noteCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#6EE7B7' },
  noteFormTitle: { fontSize: 13, fontWeight: '500', color: '#6EE7B7', marginBottom: 10 },
  noteInput: { borderWidth: 0.5, borderColor: '#21262D', borderRadius: 10, padding: 10, fontSize: 13, minHeight: 80, textAlignVertical: 'top', marginBottom: 10, color: 'white', backgroundColor: '#0D1117' },
  noteButtons: { flexDirection: 'row', gap: 8 },
  cancelButton: { flex: 1, backgroundColor: '#1F2937', borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelButtonText: { color: '#6B7280', fontWeight: '500', fontSize: 13 },
  sendButton: { flex: 1, backgroundColor: '#064E3B', borderRadius: 10, padding: 12, alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#1A3A2A' },
  sendButtonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 13 },
});