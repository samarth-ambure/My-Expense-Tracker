import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, CreditCard, MapPin } from 'lucide-react-native';

export default function App() {
  const [amount, setAmount] = useState('');
  const [payTo, setPayTo] = useState('');
  const [expenses, setExpenses] = useState([]);

  // Load data when app starts
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const storedData = await AsyncStorage.getItem('@expenses');
    if (storedData) setExpenses(JSON.parse(storedData));
  };

  const saveExpense = async () => {
    if (!amount || !payTo) return; // Don't save empty fields

    const newExpense = { 
      id: Date.now().toString(), 
      amount, 
      payTo 
    };
    
    const updatedList = [newExpense, ...expenses];
    setExpenses(updatedList);
    await AsyncStorage.setItem('@expenses', JSON.stringify(updatedList));
    
    // Clear inputs
    setAmount('');
    setPayTo('');
  };

  const deleteExpense = async (id) => {
    const filteredList = expenses.filter(item => item.id !== id);
    setExpenses(filteredList);
    await AsyncStorage.setItem('@expenses', JSON.stringify(filteredList));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Amount (e.g. 50)" 
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Where to pay? (e.g. Starbucks)" 
          value={payTo}
          onChangeText={setPayTo}
        />
        <TouchableOpacity style={styles.addButton} onPress={saveExpense}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* List Section */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardAmount}>${item.amount}</Text>
              <View style={styles.row}>
                <MapPin size={14} color="#666" />
                <Text style={styles.cardPayTo}> {item.payTo}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
              <Trash2 size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 40 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { 
    backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 10, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2
  },
  cardAmount: { fontSize: 18, fontWeight: 'bold' },
  cardPayTo: { color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 }
});