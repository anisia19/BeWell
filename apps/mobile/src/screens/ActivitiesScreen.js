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
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📅 Activitățile tale</Text>

      {activities.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Nu există activități programate.</Text>
        </View>
      ) : (
        activities.map((activity, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.activityType}>{activity.type}</Text>
            <Text style={styles.activityDetail}>⏱ Durată zilnică: {activity.daily_duration} min</Text>
            {activity.notes ? (
              <Text style={styles.activityNotes}>📝 {activity.notes}</Text>
            ) : null}
          </View>
        ))
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
    color: '#2196F3',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  activityDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});