import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authenticate } from '../utils/storage';

export default function AuthScreen({ onAuthenticate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submitHandler() {
    if (!email.includes('@') || password.length < 6) {
      Alert.alert('Invalid Input', 'Please enter a valid email and 6+ character password.');
      return;
    }

    setIsLoading(true);
    try {
      const authData = await authenticate(isLogin ? 'login' : 'signup', email, password);
      onAuthenticate(authData.idToken, authData.localId);
    } catch (error) {
      Alert.alert('Authentication Failed', 'Please check your credentials.');
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Create Account'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={submitHandler}>
        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>{isLogin ? 'New user? Sign Up' : 'Have an account? Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  toggle: { marginTop: 15, textAlign: 'center', color: '#666' }
});