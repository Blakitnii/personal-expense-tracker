import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';

import HomeScreen from './src/screens/HomeScreen';
import AddExpense from './src/screens/AddExpense';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Якщо користувач увійшов, записуємо його
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Екрани для авторизованих
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Мій бюджет' }} />
            <Stack.Screen name="AddExpense" component={AddExpense} options={{ title: 'Додати' }} />
          </>
        ) : (
          // Екран входу
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}