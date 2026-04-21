import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Помилка', 'Будь ласка, заповніть усі поля');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        Alert.alert('Успіх', 'Акаунт успішно створено');
      }
    } catch (error) {
      let message = 'Сталася помилка';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Цей email уже використовується';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Невірний пароль';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Користувача не знайдено';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Некоректний email';
      } else if (error.code === 'auth/weak-password') {
        message = 'Пароль має бути щонайменше 6 символів';
      }

      Alert.alert('Помилка', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />

        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Text style={styles.logoIcon}>💰</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            {isLogin ? 'З поверненням' : 'Створити акаунт'}
          </Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? 'Увійди, щоб керувати своїми витратами та доходами'
              : 'Зареєструйся, щоб почати вести особистий бюджет'}
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Введіть email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="Введіть пароль"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAuth}
              disabled={loading}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={['#7C3AED', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Увійти' : 'Зареєструватися'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.8}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? 'Немає акаунта? Зареєструватися'
                  : 'Вже є акаунт? Увійти'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },

  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },

  backgroundGlowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },

  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(79, 70, 229, 0.14)',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  logoIcon: {
    fontSize: 34,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  formCard: {
    backgroundColor: '#151A23',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#202634',
  },

  label: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    backgroundColor: '#0F141D',
    borderWidth: 1,
    borderColor: '#262D3D',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 16,
  },

  buttonWrapper: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },

  button: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
  },

  switchText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '600',
  },
});