import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { ensureUserExists } from './src/services/budgetService';

import HomeScreen from './src/screens/HomeScreen';
import AddExpense from './src/screens/AddExpense';
import LoginScreen from './src/screens/LoginScreen';
import Statistics from './src/screens/Statistics';
import ProfileScreen from './src/screens/ProfileScreen';
import EditExpenseScreen from './src/screens/EditExpenseScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0F1115',
    card: '#151922',
    text: '#FFFFFF',
    border: '#262B36',
    primary: '#7C3AED',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#151922',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#151922',
          borderTopColor: '#262B36',
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#8B93A7',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Головна',
          tabBarLabel: 'Головна',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: color,
                marginBottom: 2,
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Statistics"
        component={Statistics}
        options={{
          title: 'Статистика',
          tabBarLabel: 'Статистика',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: color,
                marginBottom: 2,
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профіль',
          tabBarLabel: 'Профіль',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 2,
                borderColor: color,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: color,
                  marginTop: -1,
                }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AddExpense"
        component={AddExpense}
        options={{
          title: 'Додати операцію',
          tabBarLabel: 'Додати',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: color,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 2,
                  backgroundColor: '#0F1115',
                  position: 'absolute',
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 10,
                  backgroundColor: '#0F1115',
                  position: 'absolute',
                }}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          await ensureUserExists(currentUser);
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Помилка ініціалізації користувача:', error);
        setUser(currentUser || null);
      } finally {
        setCheckingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0F1115',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditExpense"
              component={EditExpenseScreen}
              options={{
                headerShown: true,
                title: 'Редагування',
                headerStyle: { backgroundColor: '#151922' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}