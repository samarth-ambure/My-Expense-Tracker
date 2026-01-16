import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { saveExpensesToStorage, getExpensesFromStorage, updateExpenseInStorage } from '../utils/storage';

export default function ManageExpense({ route, navigation }) {
  // Check if an expense ID was passed (Editing mode)
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [amount, setAmount] = useState(route.params?.amount || '');
  const [payTo, setPayTo] = useState(route.params?.payTo || '');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
    });
  }, [navigation, isEditing]);

  async function confirmHandler() {
    if (isEditing) {
      await updateExpenseInStorage(editedExpenseId, { amount, payTo });
    } else {
      const existing = await getExpensesFromStorage();
      const newExpense = { id: Date.now().toString(), amount, payTo, date: new Date() };
      await saveExpensesToStorage([newExpense, ...existing]);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Where?" value={payTo} onChangeText={setPayTo} />
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => navigation.goBack()}>
          <Text style={{color: '#007AFF'}}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={confirmHandler}>
          <Text style={{color: 'white'}}>{isEditing ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F8F9FA' },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 10, borderWidth: 1, borderColor: '#DDD' },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btn: { backgroundColor: '#007AFF', padding: 15, alignItems: 'center', borderRadius: 6, flex: 1, marginHorizontal: 5 },
    cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' }
});