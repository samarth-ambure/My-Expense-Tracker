import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // Fixed Warning
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, MapPin, Wallet } from 'lucide-react-native';

export default function App() {
  const [amount, setAmount] = useState('');
  const [payTo, setPayTo] = useState('');
  const [payVia, setPayVia] = useState(''); // Added payment method
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const storedData = await AsyncStorage.getItem('@expenses');
    if (storedData) {
      setExpenses(JSON.parse(storedData));
    }
  };

  const saveExpense = async () => {
    if (!amount || !payTo) return;

    const newExpense = { 
      id: Date.now().toString(), // Unique Key
      amount, 
      payTo,
      payVia: payVia || 'Cash' 
    };
    
    const updatedList = [newExpense, ...expenses];
    setExpenses(updatedList);
    await AsyncStorage.setItem('@expenses', JSON.stringify(updatedList));
    
    setAmount('');
    setPayTo('');
    setPayVia('');
  };

  const deleteExpense = async (id) => {
    const filteredList = expenses.filter(item => item.id !== id);
    setExpenses(filteredList);
    await AsyncStorage.setItem('@expenses', JSON.stringify(filteredList));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Expense Tracker</Text>

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
            placeholder="Where to pay? (e.g. Zomato)" 
            value={payTo}
            onChangeText={setPayTo}
          />
          <TextInput 
            style={styles.input} 
            placeholder="How? (e.g. UPI, GPay, Card)" 
            value={payVia}
            onChangeText={setPayVia}
          />
          <TouchableOpacity style={styles.addButton} onPress={saveExpense}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id} // Fixed "Unique Key" Error
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.cardAmount}>₹{item.amount}</Text>
                <View style={styles.row}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.cardDetail}> {item.payTo}</Text>
                </View>
                <View style={styles.row}>
                  <Wallet size={14} color="#666" />
                  <Text style={styles.cardDetail}> Via: {item.payVia}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', marginVertical: 20, color: '#1A1A1A' },
  inputContainer: { marginBottom: 25 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: { 
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderLeftWidth: 5, borderLeftColor: '#34C759',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  cardAmount: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  cardDetail: { color: '#666', fontSize: 14, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 }
});