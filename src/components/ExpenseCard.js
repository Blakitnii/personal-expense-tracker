import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Словник для автоматичного підбору іконок та назв
const CATEGORY_MAP = {
  food: { label: 'Їжа', icon: '🛒', color: '#FF9800' },
  transport: { label: 'Транспорт', icon: '🚗', color: '#2196F3' },
  home: { label: 'Дім', icon: '🏠', color: '#9C27B0' },
  fun: { label: 'Розваги', icon: '🎮', color: '#E91E63' },
  health: { label: 'Здоров’я', icon: '💊', color: '#4CAF50' },
  other: { label: 'Інше', icon: '📦', color: '#607D8B' },
  income: { label: 'Зарахування', icon: '💰', color: '#4CAF50' },
};

const ExpenseCard = ({ title, amount, type, category, onDelete }) => {
  const isIncome = type === 'income';
  
  // Отримуємо дані категорії, або беремо 'other', якщо щось пішло не так
  const categoryData = isIncome ? CATEGORY_MAP.income : (CATEGORY_MAP[category] || CATEGORY_MAP.other);

  return (
    <View style={styles.card}>
      {/* Ліва частина: Кругла іконка */}
      <View style={[styles.iconBox, { backgroundColor: categoryData.color + '15' }]}>
        <Text style={styles.emoji}>{categoryData.icon}</Text>
      </View>
      
      {/* Середня частина: Текст */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.categoryLabel}>{categoryData.label}</Text>
      </View>

      {/* Права частина: Сума та Видалення */}
      <View style={styles.rightSide}>
        <Text style={[styles.amount, { color: isIncome ? '#2E7D32' : '#C62828' }]}>
          {isIncome ? '+' : '-'}{amount.toLocaleString()} ₴
        </Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteArea}>
          <Text style={styles.deleteText}>Видалити</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    // Тіні
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2D3436' },
  categoryLabel: { fontSize: 12, color: '#A0A0A0', marginTop: 2, fontWeight: '500' },
  rightSide: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold' },
  deleteArea: { marginTop: 6, paddingVertical: 2 },
  deleteText: { fontSize: 10, color: '#FF5252', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.6 }
});

export default ExpenseCard;