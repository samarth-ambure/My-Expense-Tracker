import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

const BACKEND_URL = 'https://my-expence-tracker-b677a-default-rtdb.firebaseio.com';


const checkConnection = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    Alert.alert(
      "No Internet Connection",
      "Please check your data or Wi-Fi settings to sync your expenses."
    );
    return false;
  }
  return true;
};

export const saveExpensesToStorage = async (expenseData) => {
  const isConnected = await checkConnection();
  if (!isConnected) throw new Error("No Internet");

  const response = await axios.post(`${BACKEND_URL}/expenses.json`, expenseData);
  return response.data.name;
};
// 2. Fetch all Expenses from Firebase (GET)
export const getExpensesFromStorage = async () => {
  const response = await axios.get(`${BACKEND_URL}/expenses.json`);
  
  const expenses = [];
  for (const key in response.data) {
    expenses.push({
      id: key, 
      amount: response.data[key].amount,
      date: response.data[key].date,
      payTo: response.data[key].payTo,
      category: response.data[key].category
    });
  }
  return expenses.reverse(); 
};

// 3. Update Expense (PATCH)
export const updateExpenseInStorage = async (id, updatedExpenseData) => {
  return axios.patch(`${BACKEND_URL}/expenses/${id}.json`, updatedExpenseData);
};

// 4. Delete Expense (DELETE)
export const deleteExpenseFromStorage = async (id) => {
  return axios.delete(`${BACKEND_URL}/expenses/${id}.json`);
};