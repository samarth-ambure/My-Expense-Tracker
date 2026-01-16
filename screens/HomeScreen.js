import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpenseItem } from '../components/ExpenseItem';
import { getExpensesFromStorage, saveExpensesToStorage } from '../utils/storage';

export default function HomeScreen() {
  const [amount, setAmount] = useState('');
  const [payTo, setPayTo] = useState('');
  const [payVia, setPayVia] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const data = await getExpensesFromStorage();
    setExpenses(data);
  };

  const handleAddExpense = async () => {
    if (!amount || !payTo) return;

    const newExpense = {
      id: Date.now().toString(),
      amount,
      payTo,
      payVia: payVia || 'Cash',
    };

    const updatedList = [newExpense, ...expenses];
    setExpenses(updatedList);
    await saveExpensesToStorage(updatedList);

    setAmount('');
    setPayTo('');
    setPayVia('');
  };

  const handleDelete = async (id) => {
    const filteredList = expenses.filter(item => item.id !== id);
    setExpenses(filteredList);
    await saveExpensesToStorage(filteredList);
  };

  const totalBalance = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <Text style={styles.title}>My Expenses</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>₹{totalBalance.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Amount (₹)" 
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="numeric" 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Where to pay?" 
            value={payTo} 
            onChangeText={setPayTo} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="How? (UPI, Card, Cash)" 
            value={payVia} 
            onChangeText={setPayVia} 
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem item={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 10, color: '#1A1A1A' },
  summaryCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 15, marginVertical: 15, alignItems: 'center' },
  summaryLabel: { color: '#AAA', fontSize: 12, textTransform: 'uppercase' },
  summaryAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});