import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// API Key from your screenshot
const API_KEY = 'AIzaSyDL-t8lpBHXQ0m38kQ-YrNc1Qjvpe7s43A'; 
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

// 1. Auth Function (Signup or Login)
export const authenticate = async (mode, email, password) => {
  const isConnected = await checkConnection();
  if (!isConnected) throw new Error("No Internet");

  const url = mode === 'signup' 
    ? `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

  const response = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true,
  });

  return response.data; // Contains idToken and localId (userId)
};

// 2. Save Expense (Private to User)
export const saveExpensesToStorage = async (expenseData, token, userId) => {
  const isConnected = await checkConnection();
  if (!isConnected) throw new Error("No Internet");

  // We add ?auth=TOKEN to satisfy Firebase security rules
  const response = await axios.post(
    `${BACKEND_URL}/expenses/${userId}.json?auth=${token}`, 
    expenseData
  );
  return response.data.name;
};

// 3. Fetch Expenses (Private to User)
export const getExpensesFromStorage = async (token, userId) => {
  const isConnected = await checkConnection();
  if (!isConnected) throw new Error("No Internet");

  const response = await axios.get(
    `${BACKEND_URL}/expenses/${userId}.json?auth=${token}`
  );
  
  const expenses = [];
  for (const key in response.data) {
    expenses.push({
      id: key, 
      ...response.data[key]
    });
  }
  return expenses.reverse(); 
};

// 4. Update Expense (Private to User)
export const updateExpenseInStorage = async (id, updatedExpenseData, token, userId) => {
  return axios.patch(
    `${BACKEND_URL}/expenses/${userId}/${id}.json?auth=${token}`, 
    updatedExpenseData
  );
};

// 5. Delete Expense (Private to User)
export const deleteExpenseFromStorage = async (id, token, userId) => {
  return axios.delete(
    `${BACKEND_URL}/expenses/${userId}/${id}.json?auth=${token}`
  );
};