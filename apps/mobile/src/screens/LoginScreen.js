import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { login } from '../services/api';
import RegisterScreen from './RegisterScreen';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <RegisterScreen
        onRegister={onLogin}
        onBack={() => setShowRegister(false)}
      />
    );
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eroare', 'Introduceți email și parola.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password.trim());
      if (data.success) onLogin(data);
    } catch (error) {
      Alert.alert('Eroare', 'Email sau parolă incorectă.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>BW</Text>
          </View>
          <Text style={styles.title}>BeWell</Text>
          <Text style={styles.subtitle}>Sistem de monitorizare a sănătății</Text>
        </View>

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

          <Text style={styles.label}>Parolă</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduceți parola"
            placeholderTextColor="#4B5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#6EE7B7" />
            ) : (
              <Text style={styles.buttonText}>Autentificare</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setShowRegister(true)}
          >
            <Text style={styles.registerText}>Nu ai cont? Înregistrează-te</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 0.5, borderColor: '#065F46' },
  logoText: { fontSize: 24, fontWeight: '500', color: '#6EE7B7' },
  title: { fontSize: 32, fontWeight: '500', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  form: { width: '100%', backgroundColor: '#161B22', borderRadius: 20, padding: 20, borderWidth: 0.5, borderColor: '#21262D' },
  label: { fontSize: 13, fontWeight: '500', color: '#8B949E', marginBottom: 6 },
  input: { borderWidth: 0.5, borderColor: '#21262D', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 14, backgroundColor: '#0D1117', color: 'white' },
  button: { backgroundColor: '#064E3B', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4, borderWidth: 0.5, borderColor: '#065F46' },
  buttonDisabled: { backgroundColor: '#1A3A2A' },
  buttonText: { color: '#6EE7B7', fontWeight: '500', fontSize: 15 },
  registerButton: { marginTop: 16, alignItems: 'center' },
  registerText: { color: '#58A6FF', fontSize: 13 },
});