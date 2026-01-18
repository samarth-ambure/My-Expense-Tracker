import axios from 'axios';

const BACKEND_URL = 'https://my-expence-tracker-b677a-default-rtdb.firebaseio.com';

// 1. Send Expense to Firebase (POST)
export const saveExpensesToStorage = async (expenseData) => {
  // If we receive an array (from old local logic), we take the first item
  const dataToSend = Array.isArray(expenseData) ? expenseData[0] : expenseData;
  const response = await axios.post(`${BACKEND_URL}/expenses.json`, dataToSend);
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