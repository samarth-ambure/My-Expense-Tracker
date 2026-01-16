import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expenses';

export const saveExpensesToStorage = async (expenses) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

export const getExpensesFromStorage = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Add this to your utils/storage.js
export const updateExpenseInStorage = async (id, updatedExpenseData) => {
  const expenses = await getExpensesFromStorage();
  const expenseIndex = expenses.findIndex((exp) => exp.id === id);
  const updatedExpenses = [...expenses];
  updatedExpenses[expenseIndex] = { ...expenses[expenseIndex], ...updatedExpenseData };
  await saveExpensesToStorage(updatedExpenses);
};