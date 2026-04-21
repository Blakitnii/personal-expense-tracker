import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CATEGORY_MAP = {
  food: { label: 'Їжа', icon: '🛒', color: '#F59E0B' },
  transport: { label: 'Транспорт', icon: '🚗', color: '#3B82F6' },
  home: { label: 'Дім', icon: '🏠', color: '#8B5CF6' },
  fun: { label: 'Розваги', icon: '🎮', color: '#EC4899' },
  health: { label: 'Здоров’я', icon: '💊', color: '#22C55E' },
  other: { label: 'Інше', icon: '📦', color: '#64748B' },
  income: { label: 'Дохід', icon: '💰', color: '#22C55E' },
};

const ExpenseCard = ({
  title,
  amount,
  type,
  category,
  note,
  customDate,
  createdByEmail,
  onDelete,
  onEdit,
}) => {
  const isIncome = type === 'income';
  const categoryData = isIncome
    ? CATEGORY_MAP.income
    : CATEGORY_MAP[category] || CATEGORY_MAP.other;

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: categoryData.color + '22' },
        ]}
      >
        <Text style={styles.emoji}>{categoryData.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <Text style={styles.categoryLabel}>
          {categoryData.label}
          {customDate ? ` • ${customDate}` : ''}
        </Text>

        {!!createdByEmail && (
          <Text style={styles.author} numberOfLines={1}>
            Додав: {createdByEmail}
          </Text>
        )}

        {!!note && (
          <Text style={styles.note} numberOfLines={2}>
            {note}
          </Text>
        )}
      </View>

      <View style={styles.rightSide}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? '#22C55E' : '#EF4444' },
          ]}
        >
          {isIncome ? '+' : '-'}
          {Number(amount || 0).toLocaleString()} ₴
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Text style={styles.editText}>Редагувати</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#262B36',
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },

  emoji: {
    fontSize: 22,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  categoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },

  author: {
    fontSize: 11,
    color: '#A78BFA',
    marginTop: 5,
    fontWeight: '600',
  },

  note: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 6,
    lineHeight: 17,
  },

  rightSide: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  amount: {
    fontSize: 16,
    fontWeight: '800',
  },

  actions: {
    marginTop: 8,
    alignItems: 'flex-end',
  },

  editBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 6,
  },

  editText: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '700',
  },

  deleteBtn: {
    backgroundColor: '#2A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#472222',
  },

  deleteText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
  },
});

export default ExpenseCard;