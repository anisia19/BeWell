import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from 'react-native';

const API_BASE_URL = 'http://10.48.64.79:3001';

export default function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgot = async () => {
    if (!email.trim()) {
      Alert.alert('Eroare', 'Introduceți email-ul.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        Alert.alert('Eroare', data.error || 'Nu s-a putut trimite cererea.');
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut conecta la server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>BW</Text>
        </View>
        <Text style={styles.title}>Parolă uitată</Text>
        <Text style={styles.subtitle}>
          {sent
            ? 'Cererea a fost trimisă!'
            : 'Trimite o cerere de resetare la administrator'}
        </Text>
      </View>

      {!sent ? (
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@bewell.com"
            placeholderTextColor="#4B5563"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleForgot}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#6EE7B7" />
            ) : (
              <Text style={styles.buttonText}>Trimite cerere</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>Înapoi la autentificare</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Cerere trimisă!</Text>
            <Text style={styles.successText}>
              Administratorul a fost notificat. Vei primi noile credențiale pe email în curând.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>Înapoi la autentificare</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { padding: 24, paddingTop: 52 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 0.5, borderColor: '#065F46' },
  logoText: { fontSize: 20, fontWeight: '500', color: '#6EE7B7' },
  title: { fontSize: 24, fontWeight: '500', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  form: { backgroundColor: '#161B22', borderRadius: 20, padding: 20, borderWidth: 0.5, borderColor: '#21262D' },
  label: { fontSize: 13, fontWeight: '500', color: '#8B949E', marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: '#21262D', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, backgroundColor: '#0D1117', color: 'white' },
  button: { backgroundColor: '#064E3B', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4, borderWidth: 0.5, borderColor: '#065F46' },
  buttonDisabled: { backgroundColor: '#1A3A2A' },
  buttonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 15 },
  backButton: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#58A6FF', fontSize: 13 },
  successCard: { backgroundColor: '#064E3B', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 0.5, borderColor: '#065F46' },
  successIcon: { fontSize: 32, color: '#6EE7B7', marginBottom: 8 },
  successTitle: { fontSize: 16, fontWeight: '500', color: '#6EE7B7', marginBottom: 8 },
  successText: { fontSize: 13, color: '#A7F3D0', textAlign: 'center', lineHeight: 20 },
});