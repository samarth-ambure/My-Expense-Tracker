import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import { getExpensesFromStorage, deleteExpenseFromStorage } from '../utils/storage';
import { ExpenseItem } from '../components/ExpenseItem';

export default function RecentExpenses({ route }) {
  // 1. EXTRACT AUTH DATA FROM NAVIGATION PARAMS
  const { token, userId } = route.params;

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const isFocused = useIsFocused();

  // 2. UPDATED LOAD DATA (Passes Token and UID)
  const loadData = useCallback(async () => {
    try {
      const data = await getExpensesFromStorage(token, userId);
      setExpenses(data);
    } catch (error) {
      Alert.alert("Fetch Failed", "Could not load data from cloud.");
    }
  }, [token, userId]);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    if (isFocused) {
      fetchInitial();
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, [isFocused, loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // 3. UPDATED DELETE HANDLER (Passes Token and UID)
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
            try {
              await deleteExpenseFromStorage(id, token, userId);
              setExpenses(current => current.filter(item => item.id !== id));
            } catch (error) {
              Alert.alert("Error", "Could not delete from cloud. Check your connection.");
            }
          } 
        }
      ]
    );
  }

  const recentExpenses = expenses.filter(exp => {
    const today = new Date();
    const expDate = new Date(exp.date);
    const diffInDays = (today - expDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  });

  const recentTotal = recentExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 10, color: '#666'}}>Fetching your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode: Data sync is paused</Text>
        </View>
      )}

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
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            colors={['#007AFF']} 
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses tracked in the last 7 days.</Text>
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
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
  offlineBanner: { 
    backgroundColor: '#FF3B30', 
    padding: 8, 
    borderRadius: 5, 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  offlineText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});