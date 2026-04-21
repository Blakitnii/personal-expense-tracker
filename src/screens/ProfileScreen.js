import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebaseConfig';
import {
  createSharedBudget,
  getActiveBudgetData,
  joinSharedBudgetByCode,
} from '../services/budgetService';

export default function ProfileScreen() {
  const user = auth.currentUser;

  const [budgetData, setBudgetData] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(true);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [creatingShared, setCreatingShared] = useState(false);
  const [joiningShared, setJoiningShared] = useState(false);

  const firstLetter = user?.email ? user.email[0].toUpperCase() : 'U';

  const loadBudget = async () => {
    try {
      if (!user) return;
      setLoadingBudget(true);
      const budget = await getActiveBudgetData(user.uid);
      setBudgetData(budget);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити бюджет');
    } finally {
      setLoadingBudget(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося вийти з акаунта');
    }
  };

  const handleSoon = (title) => {
    Alert.alert('Скоро буде', `"${title}" додамо наступним кроком`);
  };

  const handleCreateSharedBudget = async () => {
    try {
      if (!user) return;

      setCreatingShared(true);
      const result = await createSharedBudget(user, 'Наш бюджет');
      await loadBudget();

      Alert.alert(
        'Спільний бюджет створено',
        `Код запрошення: ${result.inviteCode}`
      );
    } catch (error) {
      Alert.alert('Помилка', error.message || 'Не вдалося створити бюджет');
    } finally {
      setCreatingShared(false);
    }
  };

  const handleJoinSharedBudget = async () => {
    try {
      if (!user) return;

      setJoiningShared(true);
      await joinSharedBudgetByCode(user, inviteCodeInput);
      setInviteCodeInput('');
      await loadBudget();

      Alert.alert('Успіх', 'Ти успішно приєднався до спільного бюджету');
    } catch (error) {
      Alert.alert('Помилка', error.message || 'Не вдалося приєднатися');
    } finally {
      setJoiningShared(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профіль</Text>
          <Text style={styles.headerSubtitle}>
            Керуй своїм акаунтом і налаштуваннями
          </Text>
        </View>

        <LinearGradient
          colors={['#7C3AED', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Мій акаунт</Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'Email не знайдено'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активний бюджет</Text>

          <View style={styles.budgetCard}>
            {loadingBudget ? (
              <ActivityIndicator color="#7C3AED" />
            ) : budgetData ? (
              <>
                <Text style={styles.budgetName}>{budgetData.name || 'Без назви'}</Text>
                <Text style={styles.budgetMeta}>
                  Тип: {budgetData.type === 'shared' ? 'Спільний' : 'Особистий'}
                </Text>

                {budgetData.inviteCode ? (
                  <Text style={styles.budgetMeta}>
                    Код запрошення: {budgetData.inviteCode}
                  </Text>
                ) : (
                  <Text style={styles.budgetMeta}>Код запрошення відсутній</Text>
                )}

                <Text style={styles.budgetMeta}>
                  Учасників: {budgetData.members?.length || 0}
                </Text>
              </>
            ) : (
              <Text style={styles.budgetMeta}>Не вдалося завантажити бюджет</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Спільний бюджет</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateSharedBudget}
            disabled={creatingShared}
          >
            <Text style={styles.actionButtonText}>
              {creatingShared ? 'Створення...' : 'Створити спільний бюджет'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Введи код запрошення"
            placeholderTextColor="#6B7280"
            value={inviteCodeInput}
            onChangeText={setInviteCodeInput}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinSharedBudget}
            disabled={joiningShared}
          >
            <Text style={styles.joinButtonText}>
              {joiningShared ? 'Підключення...' : 'Приєднатися по коду'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Акаунт</Text>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSoon('Редагування профілю')}
          >
            <View>
              <Text style={styles.itemTitle}>Редагувати профіль</Text>
              <Text style={styles.itemSubtitle}>
                Ім’я, аватар, персональні дані
              </Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSoon('Зміна пароля')}
          >
            <View>
              <Text style={styles.itemTitle}>Змінити пароль</Text>
              <Text style={styles.itemSubtitle}>
                Оновлення пароля акаунта
              </Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Налаштування</Text>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSoon('Категорії')}
          >
            <View>
              <Text style={styles.itemTitle}>Мої категорії</Text>
              <Text style={styles.itemSubtitle}>
                Додати або змінити категорії
              </Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSoon('Нагадування')}
          >
            <View>
              <Text style={styles.itemTitle}>Нагадування</Text>
              <Text style={styles.itemSubtitle}>
                Щоб не забувати додавати витрати
              </Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Вийти з акаунта</Text>
        </TouchableOpacity>
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

  profileCard: {
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },

  profileEmail: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  budgetCard: {
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262B36',
  },

  budgetName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },

  budgetMeta: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 6,
  },

  actionButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  input: {
    backgroundColor: '#11151D',
    borderWidth: 1,
    borderColor: '#2A3140',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
  },

  joinButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },

  joinButtonText: {
    color: '#BFDBFE',
    fontSize: 15,
    fontWeight: '800',
  },

  item: {
    backgroundColor: '#1A1D24',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#262B36',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  itemSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    maxWidth: 250,
    lineHeight: 18,
  },

  itemArrow: {
    color: '#7C3AED',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },

  logoutButton: {
    marginTop: 8,
    backgroundColor: '#2A1618',
    borderWidth: 1,
    borderColor: '#4B1E23',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  logoutText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '800',
  },
});