import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { getExpensesFromStorage, deleteExpenseFromStorage } from '../utils/storage';
import { ExpenseItem } from '../components/ExpenseItem';

export default function AllExpenses({ route }) {
  // 1. EXTRACT AUTH DATA FROM PARAMS
  const { token, userId } = route.params;

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isFocused = useIsFocused();

  // 2. CONSOLIDATED LOAD DATA FUNCTION
  const loadData = useCallback(async () => {
    try {
      const data = await getExpensesFromStorage(token, userId);
      setExpenses(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch expenses from the cloud.");
    }
  }, [token, userId]);

  useEffect(() => {
    async function initialFetch() {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    }
    if (isFocused) {
      initialFetch();
    }
  }, [isFocused, loadData]);

  // 3. PULL TO REFRESH LOGIC
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // 4. CLEANED DELETE HANDLER (Optimistic Update)
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
            const originalExpenses = [...expenses];
            // Update UI first
            setExpenses(current => current.filter(item => item.id !== id));

            try {
              // Delete from Firebase using auth params
              await deleteExpenseFromStorage(id, token, userId);
            } catch (error) {
              // Rollback if cloud sync fails
              setExpenses(originalExpenses);
              Alert.alert("Error", "Cloud sync failed. Item restored.");
            }
          } 
        }
      ]
    );
  }

  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.text}>Total Historical Spends</Text>
        <Text style={styles.total}>₹{total.toLocaleString('en-IN')}</Text>
      </View>
      <FlatList 
        data={expenses} 
        keyExtractor={(item) => item.id} 
        renderItem={({item}) => (
          <ExpenseItem item={item} onDelete={deleteHandler} />
        )} 
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            colors={['#007AFF']} 
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses recorded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoCard: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginBottom: 15 },
  text: { color: 'white', opacity: 0.8 },
  total: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' }
});