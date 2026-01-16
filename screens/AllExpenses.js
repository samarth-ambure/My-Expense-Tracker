import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getExpensesFromStorage, saveExpensesToStorage } from '../utils/storage';
import { ExpenseItem } from '../components/ExpenseItem';

export default function AllExpenses() {
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

  // FIXED: Added the delete logic here
  async function deleteHandler(id) {
    const updatedList = expenses.filter(item => item.id !== id);
    setExpenses(updatedList);
    await saveExpensesToStorage(updatedList);
  }

  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.text}>Total Historical Spending</Text>
        <Text style={styles.total}>₹{total.toLocaleString('en-IN')}</Text>
      </View>
      <FlatList 
        data={expenses} 
        keyExtractor={(item) => item.id} 
        renderItem={({item}) => (
          <ExpenseItem item={item} onDelete={deleteHandler} /> // FIXED: Passing onDelete
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  infoCard: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginBottom: 15 },
  text: { color: 'white', opacity: 0.8 },
  total: { color: 'white', fontSize: 24, fontWeight: 'bold' }
});