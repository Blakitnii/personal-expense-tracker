import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

const CATEGORY_MAP = {
  food: { label: 'Їжа', icon: '🛒', color: '#F59E0B' },
  transport: { label: 'Транспорт', icon: '🚗', color: '#3B82F6' },
  home: { label: 'Дім', icon: '🏠', color: '#8B5CF6' },
  fun: { label: 'Розваги', icon: '🎮', color: '#EC4899' },
  health: { label: 'Здоров’я', icon: '💊', color: '#22C55E' },
  other: { label: 'Інше', icon: '📦', color: '#64748B' },
};

export default function Statistics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBudgetId, setActiveBudgetId] = useState(null);

  useEffect(() => {
    let unsubscribeTransactions = null;

    const loadBudgetAndSubscribe = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const budgetId = userData.activeBudgetId;

        if (!budgetId) {
          setLoading(false);
          return;
        }

        setActiveBudgetId(budgetId);

        const q = query(
          collection(db, 'transactions'),
          where('budgetId', '==', budgetId)
        );

        unsubscribeTransactions = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));

            setTransactions(list);
            setLoading(false);
          },
          (error) => {
            console.log('Помилка завантаження статистики:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.log('Помилка завантаження бюджету для статистики:', error);
        setLoading(false);
      }
    };

    loadBudgetAndSubscribe();

    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
    };
  }, []);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    const categories = {
      food: 0,
      transport: 0,
      home: 0,
      fun: 0,
      health: 0,
      other: 0,
    };

    transactions.forEach((item) => {
      const amount = Number(item.amount) || 0;

      if (item.type === 'income') {
        income += amount;
        incomeCount += 1;
      } else {
        expense += amount;
        expenseCount += 1;

        if (categories[item.category] !== undefined) {
          categories[item.category] += amount;
        } else {
          categories.other += amount;
        }
      }
    });

    const categoryList = Object.keys(categories)
      .map((key) => ({
        key,
        ...CATEGORY_MAP[key],
        amount: categories[key],
        percent: expense > 0 ? (categories[key] / expense) * 100 : 0,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      balance: income - expense,
      incomeCount,
      expenseCount,
      totalCount: transactions.length,
      categoryList,
    };
  }, [transactions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Статистика</Text>
          <Text style={styles.headerSubtitle}>
            Огляд доходів, витрат і категорій твого бюджету
          </Text>
        </View>

        <LinearGradient
          colors={['#7C3AED', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Поточний баланс</Text>
          <Text style={styles.balanceValue}>
            {stats.balance.toLocaleString()} ₴
          </Text>

          <View style={styles.balanceBottomRow}>
            <View style={styles.balanceMiniBox}>
              <Text style={styles.balanceMiniLabel}>Доходи</Text>
              <Text style={styles.balanceMiniIncome}>
                +{stats.income.toLocaleString()} ₴
              </Text>
            </View>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceMiniBox}>
              <Text style={styles.balanceMiniLabel}>Витрати</Text>
              <Text style={styles.balanceMiniExpense}>
                -{stats.expense.toLocaleString()} ₴
              </Text>
            </View>
          </View>

          {!!activeBudgetId && (
            <Text style={styles.budgetHint}>Бюджет: {activeBudgetId}</Text>
          )}
        </LinearGradient>

        <View style={styles.cardsRow}>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Усього операцій</Text>
            <Text style={styles.smallCardValue}>{stats.totalCount}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Доходів</Text>
            <Text style={[styles.smallCardValue, { color: '#22C55E' }]}>
              {stats.incomeCount}
            </Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Витрат</Text>
            <Text style={[styles.smallCardValue, { color: '#EF4444' }]}>
              {stats.expenseCount}
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>Найбільша категорія</Text>
            <Text style={styles.smallCardValueSmall}>
              {stats.categoryList.length > 0 ? stats.categoryList[0].label : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Витрати по категоріях</Text>

          {stats.categoryList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>Ще немає статистики</Text>
              <Text style={styles.emptyText}>
                Додай кілька витрат, і тут з’явиться розподіл по категоріях
              </Text>
            </View>
          ) : (
            stats.categoryList.map((item) => (
              <View key={item.key} style={styles.categoryCard}>
                <View style={styles.categoryTop}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        { backgroundColor: item.color + '22' },
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{item.icon}</Text>
                    </View>

                    <View>
                      <Text style={styles.categoryName}>{item.label}</Text>
                      <Text style={styles.categoryAmount}>
                        {item.amount.toLocaleString()} ₴
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.categoryPercent}>
                    {item.percent.toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(item.percent, 4)}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
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
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1115',
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

  balanceCard: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 18,
  },

  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
    fontWeight: '600',
  },

  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 18,
  },

  balanceBottomRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: 18,
    padding: 12,
  },

  balanceMiniBox: {
    flex: 1,
    alignItems: 'center',
  },

  balanceMiniLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },

  balanceMiniIncome: {
    fontSize: 15,
    fontWeight: '800',
    color: '#86EFAC',
  },

  balanceMiniExpense: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FCA5A5',
  },

  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 8,
  },

  budgetHint: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  smallCard: {
    width: '48.2%',
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262B36',
  },

  smallCardTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
    fontWeight: '600',
  },

  smallCardValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  smallCardValueSmall: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  section: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },

  emptyBox: {
    backgroundColor: '#1A1D24',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262B36',
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },

  categoryCard: {
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262B36',
  },

  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  categoryIcon: {
    fontSize: 20,
  },

  categoryName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  categoryAmount: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 3,
  },

  categoryPercent: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    marginLeft: 10,
  },

  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#11151D',
    borderRadius: 999,
    marginTop: 14,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});