import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'food', label: 'Їжа', icon: '🛒', color: '#F59E0B' },
  { id: 'transport', label: 'Транспорт', icon: '🚗', color: '#3B82F6' },
  { id: 'home', label: 'Дім', icon: '🏠', color: '#8B5CF6' },
  { id: 'fun', label: 'Розваги', icon: '🎮', color: '#EC4899' },
  { id: 'health', label: 'Здоров’я', icon: '💊', color: '#22C55E' },
  { id: 'other', label: 'Інше', icon: '📦', color: '#64748B' },
];

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${day}.${month}.${year}`;
}

export default function EditExpenseScreen({ route, navigation }) {
  const { transaction } = route.params;

  const [title, setTitle] = useState(transaction.title || '');
  const [amount, setAmount] = useState(String(transaction.amount || ''));
  const [type, setType] = useState(transaction.type || 'expense');
  const [category, setCategory] = useState(
    transaction.type === 'expense'
      ? transaction.category || 'other'
      : 'income'
  );
  const [note, setNote] = useState(transaction.note || '');
  const [customDate, setCustomDate] = useState(
    transaction.customDate || getTodayDate()
  );

  const handleUpdate = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Помилка', 'Заповніть назву та суму');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Помилка', 'Введіть коректну суму');
      return;
    }

    try {
      await updateDoc(doc(db, 'transactions', transaction.id), {
        title: title.trim(),
        amount: numericAmount,
        type,
        category: type === 'expense' ? category : 'income',
        note: note.trim(),
        customDate: customDate.trim(),
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Помилка', 'Не вдалося оновити запис: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Редагувати операцію</Text>
          <Text style={styles.headerSubtitle}>
            Зміни дані та збережи оновлений запис
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Тип операції</Text>

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && styles.typeBtnIncomeActive,
              ]}
              onPress={() => setType('income')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'income' && styles.typeBtnTextActive,
                ]}
              >
                Дохід (+)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && styles.typeBtnExpenseActive,
              ]}
              onPress={() => setType('expense')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'expense' && styles.typeBtnTextActive,
                ]}
              >
                Витрата (-)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Назва</Text>
          <TextInput
            style={styles.input}
            placeholder="Наприклад: Сільпо"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Сума (₴)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Дата</Text>
          <TextInput
            style={styles.input}
            placeholder="Наприклад: 21.04.2026"
            placeholderTextColor="#6B7280"
            value={customDate}
            onChangeText={setCustomDate}
          />

          <Text style={styles.label}>Коментар</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Додай коротку примітку"
            placeholderTextColor="#6B7280"
            value={note}
            onChangeText={setNote}
            multiline
          />

          {type === 'expense' && (
            <View style={styles.categorySection}>
              <Text style={styles.label}>Категорія</Text>

              <View style={styles.categoryGrid}>
                {CATEGORIES.map((item) => {
                  const selected = category === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.categoryItem,
                        selected && {
                          borderColor: item.color,
                          backgroundColor: item.color + '22',
                        },
                      ]}
                      onPress={() => setCategory(item.id)}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.categoryIconWrap,
                          { backgroundColor: item.color + '22' },
                        ]}
                      >
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                      </View>

                      <Text
                        style={[
                          styles.categoryLabel,
                          selected && styles.categoryLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleUpdate}
            activeOpacity={0.85}
            style={styles.saveButtonWrap}
          >
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Оновити</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1115',
  },

  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
    marginTop: 6,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
  },

  card: {
    backgroundColor: '#1A1D24',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262B36',
  },

  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  input: {
    backgroundColor: '#11151D',
    borderWidth: 1,
    borderColor: '#2A3140',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 18,
  },

  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  typeBtn: {
    width: '48.5%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#11151D',
    borderWidth: 1,
    borderColor: '#2A3140',
  },

  typeBtnIncomeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderColor: '#22C55E',
  },

  typeBtnExpenseActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
  },

  typeBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },

  typeBtnTextActive: {
    color: '#FFFFFF',
  },

  categorySection: {
    marginBottom: 8,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryItem: {
    width: '48%',
    backgroundColor: '#11151D',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3140',
    alignItems: 'center',
  },

  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  categoryIcon: {
    fontSize: 20,
  },

  categoryLabel: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '700',
    textAlign: 'center',
  },

  categoryLabelSelected: {
    color: '#FFFFFF',
  },

  saveButtonWrap: {
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },

  saveButton: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});