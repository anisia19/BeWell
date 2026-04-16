import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { register } from '../services/api';

export default function RegisterScreen({ onRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cnp, setCnp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !cnp || !phone) {
      Alert.alert('Eroare', 'Toate câmpurile sunt obligatorii.');
      return;
    }
    if (cnp.length !== 13) {
      Alert.alert('Eroare', 'CNP-ul trebuie să aibă 13 cifre.');
      return;
    }
    setLoading(true);
    try {
      const data = await register(email, password, firstName, lastName, cnp, phone);
      if (data.success) onRegister(data);
    } catch (error) {
      Alert.alert('Eroare', error.message || 'Înregistrarea a eșuat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>BW</Text>
        </View>
        <Text style={styles.title}>BeWell</Text>
        <Text style={styles.subtitle}>Creează cont nou</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Prenume</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: Maria"
          placeholderTextColor="#4B5563"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Nume</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: Ionescu"
          placeholderTextColor="#4B5563"
          value={lastName}
          onChangeText={setLastName}
        />

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

        <Text style={styles.label}>Parolă</Text>
        <TextInput
          style={styles.input}
          placeholder="Introduceți parola"
          placeholderTextColor="#4B5563"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>CNP</Text>
        <TextInput
          style={styles.input}
          placeholder="13 cifre"
          placeholderTextColor="#4B5563"
          value={cnp}
          onChangeText={setCnp}
          keyboardType="numeric"
          maxLength={13}
        />

        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="07xxxxxxxx"
          placeholderTextColor="#4B5563"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#6EE7B7" />
          ) : (
            <Text style={styles.buttonText}>Înregistrare</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Ai deja cont? Autentifică-te</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { padding: 24, paddingTop: 52 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 0.5, borderColor: '#065F46' },
  logoText: { fontSize: 20, fontWeight: '500', color: '#6EE7B7' },
  title: { fontSize: 28, fontWeight: '500', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280' },
  form: { backgroundColor: '#161B22', borderRadius: 20, padding: 20, borderWidth: 0.5, borderColor: '#21262D' },
  label: { fontSize: 13, fontWeight: '500', color: '#8B949E', marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: '#21262D', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, backgroundColor: '#0D1117', color: 'white' },
  button: { backgroundColor: '#064E3B', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4, borderWidth: 0.5, borderColor: '#065F46' },
  buttonDisabled: { backgroundColor: '#1A3A2A' },
  buttonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 15 },
  backButton: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#58A6FF', fontSize: 13 },
});