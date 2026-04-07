import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getRecommendations } from '../services/api';

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Eroare la încărcarea recomandărilor:', error);
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
      <Text style={styles.header}>💊 Recomandările medicului</Text>

      {recommendations.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Nu există recomandări momentan.</Text>
        </View>
      ) : (
        recommendations.map((rec, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rec.type}</Text>
            </View>
            <Text style={styles.recDetail}>
              ⏱ Durată zilnică: {rec.daily_duration} min
            </Text>
            {rec.notes ? (
              <Text style={styles.recNotes}>📝 {rec.notes}</Text>
            ) : null}
            <Text style={styles.recDate}>
              📅 Adăugat: {new Date(rec.created_at).toLocaleDateString('ro-RO')}
            </Text>
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
  badge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  recDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  recNotes: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  recDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});