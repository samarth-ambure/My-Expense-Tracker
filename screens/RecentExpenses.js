import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getExpensesFromStorage, saveExpensesToStorage } from '../utils/storage';
import { ExpenseItem } from '../components/ExpenseItem';

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

  // FIXED: Added the delete logic here
  async function deleteHandler(id) {
    const updatedList = expenses.filter(item => item.id !== id);
    setExpenses(updatedList);
    await saveExpensesToStorage(updatedList);
  }

  const recent = expenses.filter(exp => {
    const today = new Date();
    const expDate = new Date(parseInt(exp.id)); 
    const diff = (today - expDate) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <View style={styles.container}>
      <FlatList 
        data={recent} 
        keyExtractor={(item) => item.id} 
        renderItem={({item}) => (
          <ExpenseItem item={item} onDelete={deleteHandler} /> // FIXED: Passing onDelete
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' }
});