import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getActivities } from '../services/api';

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Eroare la încărcarea activităților:', error);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerSub}>Programul tău</Text>
        <Text style={styles.headerTitle}>Activități</Text>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nu există activități programate.</Text>
        </View>
      ) : (
        activities.map((activity, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.dot} />
              <Text style={styles.activityType}>{activity.type}</Text>
            </View>
            <Text style={styles.activityDetail}>
              Durată zilnică: {activity.daily_duration} min
            </Text>
            {activity.notes ? (
              <Text style={styles.activityNotes}>{activity.notes}</Text>
            ) : null}
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
  card: { backgroundColor: '#161B22', borderRadius: 16, padding: 14, marginHorizontal: 12, marginBottom: 10, borderWidth: 0.5, borderColor: '#21262D' },
  emptyCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 20, marginHorizontal: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#21262D' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6EE7B7', marginRight: 8 },
  activityType: { fontSize: 15, fontWeight: '500', color: 'white' },
  activityDetail: { fontSize: 13, color: '#8B949E', marginBottom: 4 },
  activityNotes: { fontSize: 12, color: '#6B7280' },
});