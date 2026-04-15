import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Режим: true - Вхід, false - Реєстрація
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Помилка", "Будь ласка, заповніть усі поля");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // ЛОГІКА ВХОДУ
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // ЛОГІКА РЕЄСТРАЦІЇ
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Успіх", "Акаунт створено!");
      }
    } catch (error) {
      let message = "Сталася помилка";
      if (error.code === 'auth/email-already-in-use') message = "Цей Email вже зайнятий";
      if (error.code === 'auth/wrong-password') message = "Невірний пароль";
      if (error.code === 'auth/user-not-found') message = "Користувача не знайдено";
      
      Alert.alert("Помилка", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>{isLogin ? 'З поверненням!' : 'Створити акаунт'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Увійдіть, щоб керувати бюджетом' : 'Зареєструйтесь, щоб почати облік'}
        </Text>

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput 
          style={styles.input} 
          placeholder="Пароль" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isLogin ? '#6200ee' : '#03dac6' }]} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchBtn} 
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? 'Немає акаунту? Створити зараз' : 'Вже є акаунт? Увійти'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', padding: 30 },
  emoji: { fontSize: 50, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 40, marginTop: 5 },
  input: {
    backgroundColor: '#F4F7FC',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  button: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  switchBtn: { marginTop: 25, alignItems: 'center' },
  switchText: { color: '#6200ee', fontWeight: '600', fontSize: 14 }
});