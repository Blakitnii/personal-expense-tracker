import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  where,
  getDoc,
} from 'firebase/firestore';
import ExpenseCard from '../components/ExpenseCard';

const CATEGORIES = [
  { id: 'all', label: 'Усі', icon: '🌈' },
  { id: 'food', label: 'Їжа', icon: '🛒' },
  { id: 'transport', label: 'Транспорт', icon: '🚗' },
  { id: 'home', label: 'Дім', icon: '🏠' },
  { id: 'fun', label: 'Розваги', icon: '🎮' },
  { id: 'health', label: 'Здоров’я', icon: '💊' },
  { id: 'other', label: 'Інше', icon: '📦' },
];

const DATE_FILTERS = [
  { id: 'all', label: 'Усі' },
  { id: 'today', label: 'Сьогодні' },
  { id: '7days', label: '7 днів' },
  { id: '30days', label: '30 днів' },
];

function parseCustomDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;

  const parts = dateString.split('.');
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  const date = new Date(year, month, day);

  if (
    isNaN(date.getTime()) ||
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  return date;
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear()
  );
}

export default function HomeScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [totals, setTotals] = useState({
    balance: 0,
    income: 0,
    expense: 0,
  });
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
          where('budgetId', '==', budgetId),
          orderBy('createdAt', 'desc')
        );

        unsubscribeTransactions = onSnapshot(
          q,
          (snapshot) => {
            let inc = 0;
            let exp = 0;

            const list = snapshot.docs.map((docItem) => {
              const data = docItem.data();
              data.type === 'income'
                ? (inc += Number(data.amount) || 0)
                : (exp += Number(data.amount) || 0);

              return { id: docItem.id, ...data };
            });

            setTransactions(list);
            setTotals({
              balance: inc - exp,
              income: inc,
              expense: exp,
            });
            setLoading(false);
          },
          (error) => {
            console.log('Помилка завантаження транзакцій:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.log('Помилка завантаження бюджету:', error);
        setLoading(false);
      }
    };

    loadBudgetAndSubscribe();

    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
    };
  }, []);

  useEffect(() => {
    let result = [...transactions];
    const now = new Date();

    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    if (catFilter !== 'all' && typeFilter === 'expense') {
      result = result.filter((item) => item.category === catFilter);
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter((item) =>
        String(item.title || '').toLowerCase().includes(q)
      );
    }

    if (dateFilter !== 'all') {
      result = result.filter((item) => {
        const itemDate =
          parseCustomDate(item.customDate) ||
          (item.createdAt?.toDate ? item.createdAt.toDate() : null);

        if (!itemDate) return false;

        if (dateFilter === 'today') {
          return isSameDay(itemDate, now);
        }

        if (dateFilter === '7days') {
          const diffMs = now - itemDate;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }

        if (dateFilter === '30days') {
          const diffMs = now - itemDate;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        }

        return true;
      });
    }

    setFilteredData(result);
  }, [typeFilter, catFilter, dateFilter, searchText, transactions]);

  const handleDelete = (id) => {
    Alert.alert('Видалити?', 'Цей запис зникне назавжди', [
      { text: 'Скасувати' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'transactions', id));
        },
      },
    ]);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.headerLabel}>Мій баланс</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Вихід</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.balanceText}>
          {totals.balance.toLocaleString()} ₴
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Доходи</Text>
            <Text style={styles.statIncome}>
              +{totals.income.toLocaleString()} ₴
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Витрати</Text>
            <Text style={styles.statExpense}>
              -{totals.expense.toLocaleString()} ₴
            </Text>
          </View>
        </View>

        {!!activeBudgetId && (
          <Text style={styles.budgetHint}>Бюджет: {activeBudgetId}</Text>
        )}
      </LinearGradient>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук за назвою..."
          placeholderTextColor="#6B7280"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.typeFilterRow}>
        {['all', 'income', 'expense'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, typeFilter === t && styles.typeBtnActive]}
            onPress={() => {
              setTypeFilter(t);
              setCatFilter('all');
            }}
          >
            <Text
              style={[
                styles.typeBtnText,
                typeFilter === t && styles.whiteText,
              ]}
            >
              {t === 'all' ? 'Усі' : t === 'income' ? 'Доходи' : 'Витрати'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateFilterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DATE_FILTERS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dateBtn,
                dateFilter === item.id && styles.dateBtnActive,
              ]}
              onPress={() => setDateFilter(item.id)}
            >
              <Text
                style={[
                  styles.dateBtnText,
                  dateFilter === item.id && styles.whiteText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {typeFilter === 'expense' && (
        <View style={styles.catWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catBtn,
                  catFilter === cat.id && styles.catBtnActive,
                ]}
                onPress={() => setCatFilter(cat.id)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.catText,
                    catFilter === cat.id && styles.whiteText,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        renderItem={({ item }) => (
          <ExpenseCard
            title={item.title}
            amount={item.amount}
            type={item.type}
            category={item.category}
            note={item.note}
            customDate={item.customDate}
            createdByEmail={item.createdByEmail}
            onEdit={() => navigation.navigate('EditExpense', { transaction: item })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нічого не знайдено 🔍</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1115',
  },

  header: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  headerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },

  logoutText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
  },

  balanceText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 10,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },

  statIncome: {
    color: '#22C55E',
    fontWeight: 'bold',
  },

  statExpense: {
    color: '#EF4444',
    fontWeight: 'bold',
  },

  budgetHint: {
    marginTop: 10,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },

  searchWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },

  searchInput: {
    backgroundColor: '#1A1D24',
    borderWidth: 1,
    borderColor: '#262B36',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
  },

  typeFilterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },

  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#1A1D24',
    marginHorizontal: 5,
  },

  typeBtnActive: {
    backgroundColor: '#7C3AED',
  },

  typeBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
  },

  dateFilterWrap: {
    marginTop: 12,
    paddingLeft: 16,
  },

  dateBtn: {
    backgroundColor: '#1A1D24',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#262B36',
  },

  dateBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },

  dateBtnText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },

  catWrapper: {
    marginTop: 12,
    paddingLeft: 16,
  },

  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D24',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
  },

  catBtnActive: {
    backgroundColor: '#7C3AED',
  },

  catIcon: {
    marginRight: 6,
  },

  catText: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  whiteText: {
    color: '#fff',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#7C3AED',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  fabText: {
    color: '#fff',
    fontSize: 28,
  },
});