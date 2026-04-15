import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';
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

export default function HomeScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all'); 
  const [catFilter, setCatFilter] = useState('all');   
  const [totals, setTotals] = useState({ balance: 0, income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ВАЖЛИВО: додаємо фільтр where по userId
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", auth.currentUser.uid), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let inc = 0, exp = 0;
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        data.type === 'income' ? inc += data.amount : exp += data.amount;
        return { id: doc.id, ...data };
      });
      setTransactions(list);
      setTotals({ balance: inc - exp, income: inc, expense: exp });
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = transactions;
    if (typeFilter !== 'all') result = result.filter(item => item.type === typeFilter);
    if (catFilter !== 'all' && typeFilter === 'expense') result = result.filter(item => item.category === catFilter);
    setFilteredData(result);
  }, [typeFilter, catFilter, transactions]);

  const handleDelete = (id) => {
    Alert.alert("Видалити?", "Цей запис зникне назавжди", [
      { text: "Скасувати" },
      { text: "Видалити", style: 'destructive', onPress: async () => await deleteDoc(doc(db, "transactions", id)) }
    ]);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#6200ee" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.headerLabel}>Мій баланс</Text>
          <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Вихід</Text></TouchableOpacity>
        </View>
        <Text style={styles.balanceText}>{totals.balance.toLocaleString()} ₴</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Доходи</Text>
            <Text style={styles.statIncome}>+{totals.income.toLocaleString()} ₴</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Витрати</Text>
            <Text style={styles.statExpense}>-{totals.expense.toLocaleString()} ₴</Text>
          </View>
        </View>
      </View>

      <View style={styles.typeFilterRow}>
        {['all', 'income', 'expense'].map((t) => (
          <TouchableOpacity 
            key={t}
            style={[styles.typeBtn, typeFilter === t && styles.typeBtnActive]} 
            onPress={() => { setTypeFilter(t); setCatFilter('all'); }}
          >
            <Text style={[styles.typeBtnText, typeFilter === t && styles.whiteText]}>
              {t === 'all' ? 'Усі' : t === 'income' ? 'Доходи' : 'Витрати'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {typeFilter === 'expense' && (
        <View style={styles.catWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.catBtn, catFilter === cat.id && styles.catBtnActive]}
                onPress={() => setCatFilter(cat.id)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catText, catFilter === cat.id && styles.whiteText]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
        renderItem={({ item }) => (
          <ExpenseCard 
            title={item.title} amount={item.amount} 
            type={item.type} category={item.category} 
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Нічого не знайдено 🔍</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  centered: { flex: 1, justifyContent: 'center' },
  header: { backgroundColor: '#6200ee', padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 12, opacity: 0.7, fontWeight: 'bold' },
  headerLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  balanceText: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 5, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 15, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 15, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2 },
  statIncome: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
  statExpense: { color: '#FF5252', fontSize: 14, fontWeight: 'bold' },
  typeFilterRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#fff', marginHorizontal: 4, elevation: 2 },
  typeBtnActive: { backgroundColor: '#6200ee' },
  typeBtnText: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  catWrapper: { marginTop: 15 },
  catScroll: { paddingHorizontal: 15 },
  catBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginRight: 8, elevation: 1 },
  catBtnActive: { backgroundColor: '#03dac6' },
  catIcon: { fontSize: 14, marginRight: 4 },
  catText: { fontSize: 11, fontWeight: '600', color: '#444' },
  whiteText: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#03dac6', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: '#000' }
});