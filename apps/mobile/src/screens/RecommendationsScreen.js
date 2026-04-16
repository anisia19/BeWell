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
        <ActivityIndicator size="large" color="#6EE7B7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>De la medicul tău</Text>
        <Text style={styles.headerTitle}>Recomandări</Text>
      </View>

      {recommendations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nu există recomandări momentan.</Text>
        </View>
      ) : (
        recommendations.map((rec, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rec.type}</Text>
            </View>
            <Text style={styles.recDetail}>
              Durată zilnică: {rec.daily_duration} min
            </Text>
            {rec.notes ? (
              <Text style={styles.recNotes}>{rec.notes}</Text>
            ) : null}
            <Text style={styles.recDate}>
              {new Date(rec.created_at).toLocaleDateString('ro-RO')}
            </Text>
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
  badge: { backgroundColor: '#064E3B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { fontSize: 12, color: '#6EE7B7', fontWeight: '500' },
  recDetail: { fontSize: 13, color: '#8B949E', marginBottom: 4 },
  recNotes: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  recDate: { fontSize: 11, color: '#4B5563', marginTop: 4 },
});