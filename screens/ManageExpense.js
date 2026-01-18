import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveExpensesToStorage, updateExpenseInStorage } from '../utils/storage';
import { Calendar } from 'lucide-react-native';

export default function ManageExpense({ route, navigation }) {
  // 1. EXTRACT AUTH DATA FROM ROUTE PARAMS
  const { token, userId } = route.params; 
  
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [amount, setAmount] = useState(route.params?.amount || '');
  const [payTo, setPayTo] = useState(route.params?.payTo || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'Food');
  const [date, setDate] = useState(route.params?.date ? new Date(route.params.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errors, setErrors] = useState({ amount: false, payTo: false });

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Expense' : 'Add Expense' });
  }, [navigation, isEditing]);

  const onDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const validateForm = () => {
    const isAmountValid = !isNaN(amount) && amount.trim().length > 0 && parseFloat(amount) > 0;
    const isPayToValid = payTo.trim().length > 0;
    setErrors({ amount: !isAmountValid, payTo: !isPayToValid });
    return isAmountValid && isPayToValid;
  };

  async function confirmHandler() {
    if (!validateForm()) {
        Alert.alert('Invalid Input', 'Please check your amount and destination.');
        return;
    }

    setIsSubmitting(true);
    const expenseData = { 
      amount, 
      payTo, 
      category: selectedCategory,
      date: date.toISOString() 
    };

    try {
      if (isEditing) {
        // 2. PASS TOKEN AND USERID TO STORAGE FUNCTIONS
        await updateExpenseInStorage(editedExpenseId, expenseData, token, userId);
      } else {
        // 2. PASS TOKEN AND USERID TO STORAGE FUNCTIONS
        await saveExpensesToStorage(expenseData, token, userId);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Cloud Error', 'Could not save data. Please check your internet.');
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 10}}>Syncing with Cloud...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={[styles.input, errors.amount && styles.errorInput]} 
          placeholder="Amount (₹)" 
          value={amount} 
          onChangeText={(val) => {setAmount(val); setErrors(prev => ({...prev, amount: false}))}} 
          keyboardType="numeric" 
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput 
          style={[styles.input, errors.payTo && styles.errorInput]} 
          placeholder="Where to pay?" 
          value={payTo} 
          onChangeText={(val) => {setPayTo(val); setErrors(prev => ({...prev, payTo: false}))}} 
        />
      </View>
      
      {/* Category and Date sections remain the same */}
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
        <Calendar size={20} color="#666" />
        <Text style={styles.dateText}>{date.toLocaleDateString('en-IN')}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />
      )}

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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    inputWrapper: { marginBottom: 15 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
    errorInput: { borderColor: '#FF3B30', backgroundColor: '#FFF5F5' },
    dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
    dateText: { marginLeft: 10, color: '#333' },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btn: { backgroundColor: '#007AFF', padding: 15, alignItems: 'center', borderRadius: 6, flex: 1, marginHorizontal: 5 },
    cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' }
});