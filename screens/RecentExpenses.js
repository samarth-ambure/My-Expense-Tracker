import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getExpensesFromStorage, saveExpensesToStorage } from '../utils/storage';
import { ExpenseItem } from '../components/ExpenseItem';
import { deleteExpenseFromStorage } from '../utils/storage';

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  async function loadData() {
    const data = await getExpensesFromStorage();
    setExpenses(data);
  }

  async function deleteHandler(id) {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this record?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Delete", 
          style: "destructive", 
          onPress: async () => {
            const updatedList = expenses.filter(item => item.id !== id);
            setExpenses(updatedList);
            await saveExpensesToStorage(updatedList);
          } 
        }
      ]
    );
  }

  async function deleteHandler(id) {
  Alert.alert(
    "Delete Expense",
    "Are you sure?",
    [
      { text: "No", style: "cancel" },
      { 
        text: "Yes, Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            // 1. Delete from Firebase
            await deleteExpenseFromStorage(id);
            // 2. Remove from local screen state
            const updatedList = expenses.filter(item => item.id !== id);
            setExpenses(updatedList);
          } catch (error) {
            Alert.alert("Error", "Could not delete from cloud.");
          }
        } 
      }
    ]
  );
}

  // Filter logic: Only items from the last 7 days
  const recentExpenses = expenses.filter(exp => {
    const today = new Date();
    const expDate = new Date(exp.date);
    const diffInDays = (today - expDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  });

  const recentTotal = recentExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <View style={styles.container}>
      {/* Matches AllExpenses Styling */}
      <View style={styles.infoCard}>
        <Text style={styles.text}>Last 7 Days Spends</Text>
        <Text style={styles.total}>₹{recentTotal.toLocaleString('en-IN')}</Text>
      </View>

      <FlatList 
        data={recentExpenses} 
        keyExtractor={(item) => item.id} 
        renderItem={({item}) => (
          <ExpenseItem item={item} onDelete={deleteHandler} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses tracked in the last 7 days.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  infoCard: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginBottom: 15 },
  text: { color: 'white', opacity: 0.8 },
  total: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});