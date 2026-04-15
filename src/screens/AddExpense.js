import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'food', label: 'Їжа', icon: '🛒' },
  { id: 'transport', label: 'Транспорт', icon: '🚗' },
  { id: 'home', label: 'Дім', icon: '🏠' },
  { id: 'fun', label: 'Розваги', icon: '🎮' },
  { id: 'health', label: 'Здоров’я', icon: '💊' },
  { id: 'other', label: 'Інше', icon: '📦' },
];

export default function AddExpense({ navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); 
  const [category, setCategory] = useState('other');

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert("Помилка", "Заповніть назву та суму");
      return;
    }

    try {
      // Додаємо userId для ідентифікації власника запису
      await addDoc(collection(db, "transactions"), {
        userId: auth.currentUser.uid, 
        title: title,
        amount: parseFloat(amount),
        type: type,
        category: type === 'expense' ? category : 'income',
        createdAt: serverTimestamp()
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Помилка", "Не вдалося зберегти: " + e.message);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Тип операції</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'income' && styles.incomeActive]} 
            onPress={() => setType('income')}
          >
            <Text style={type === 'income' ? styles.whiteText : styles.blackText}>Дохід (+)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'expense' && styles.expenseActive]} 
            onPress={() => setType('expense')}
          >
            <Text style={type === 'expense' ? styles.whiteText : styles.blackText}>Витрата (-)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Назва</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Напр. Сільпо" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Сума (₴)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="0.00" 
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {type === 'expense' && (
          <View style={styles.categorySection}>
            <Text style={styles.label}>Виберіть категорію</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.categoryItem, category === item.id && styles.categoryItemSelected]}
                  onPress={() => setCategory(item.id)}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text style={[styles.categoryLabel, category === item.id && styles.categoryLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Зберегти</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  label: { fontSize: 12, color: '#999', marginBottom: 8, fontWeight: '700', textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20, backgroundColor: '#fcfcfc' },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  typeBtn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#f0f0f0' },
  incomeActive: { backgroundColor: '#4CAF50' },
  expenseActive: { backgroundColor: '#F44336' },
  categorySection: { marginBottom: 20 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: '30%', backgroundColor: '#f8f8f8', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  categoryItemSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryLabel: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  categoryLabelSelected: { color: '#fff' },
  saveButton: { backgroundColor: '#6200ee', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  blackText: { color: '#333' }
});