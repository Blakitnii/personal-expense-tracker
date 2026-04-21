import { db } from '../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createPersonalBudget(user) {
  const budgetRef = await addDoc(collection(db, 'budgets'), {
    name: 'Мій бюджет',
    ownerId: user.uid,
    members: [user.uid],
    memberEmails: [user.email || ''],
    type: 'personal',
    inviteCode: null,
    createdAt: serverTimestamp(),
  });

  return budgetRef.id;
}

export async function ensureUserExists(user) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const budgetId = await createPersonalBudget(user);

    await setDoc(userRef, {
      email: user.email || '',
      activeBudgetId: budgetId,
      createdAt: serverTimestamp(),
    });

    return budgetId;
  }

  const data = snap.data();

  if (!data.activeBudgetId) {
    const budgetId = await createPersonalBudget(user);

    await setDoc(
      userRef,
      {
        ...data,
        activeBudgetId: budgetId,
      },
      { merge: true }
    );

    return budgetId;
  }

  return data.activeBudgetId;
}

export async function getActiveBudgetData(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data();
  const activeBudgetId = userData.activeBudgetId;

  if (!activeBudgetId) return null;

  const budgetRef = doc(db, 'budgets', activeBudgetId);
  const budgetSnap = await getDoc(budgetRef);

  if (!budgetSnap.exists()) return null;

  return {
    id: budgetSnap.id,
    ...budgetSnap.data(),
  };
}

export async function createSharedBudget(user, budgetName = 'Наш бюджет') {
  const inviteCode = generateInviteCode();

  const budgetRef = await addDoc(collection(db, 'budgets'), {
    name: budgetName.trim() || 'Наш бюджет',
    ownerId: user.uid,
    members: [user.uid],
    memberEmails: [user.email || ''],
    type: 'shared',
    inviteCode,
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    activeBudgetId: budgetRef.id,
  });

  return {
    id: budgetRef.id,
    inviteCode,
  };
}

export async function joinSharedBudgetByCode(user, inviteCodeRaw) {
  const inviteCode = inviteCodeRaw.trim().toUpperCase();

  if (!inviteCode) {
    throw new Error('Введіть код запрошення');
  }

  const q = query(
    collection(db, 'budgets'),
    where('inviteCode', '==', inviteCode)
  );

  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    throw new Error('Бюджет з таким кодом не знайдено');
  }

  const budgetDoc = querySnap.docs[0];
  const budgetData = budgetDoc.data();

  if (budgetData.members?.includes(user.uid)) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      activeBudgetId: budgetDoc.id,
    });

    return {
      id: budgetDoc.id,
      ...budgetData,
    };
  }

  await updateDoc(doc(db, 'budgets', budgetDoc.id), {
    members: arrayUnion(user.uid),
    memberEmails: arrayUnion(user.email || ''),
  });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    activeBudgetId: budgetDoc.id,
  });

  return {
    id: budgetDoc.id,
    ...budgetData,
  };
}