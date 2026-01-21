import React, { useState, useLayoutEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera } from 'react-native-image-picker'; // Required for Camera
import axios from 'axios';
import { saveExpensesToStorage, updateExpenseInStorage } from '../utils/storage';
import { Calendar, Camera } from 'lucide-react-native';

// VERYFI CREDENTIALS
const VERYFI_CLIENT_ID = 'your_client_id'; 
const VERYFI_USERNAME = 'your_username';
const VERYFI_API_KEY = 'your_api_key';

export default function ManageExpense({ route, navigation }) {
  const { token, userId } = route.params; 
  
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [amount, setAmount] = useState(route.params?.amount || '');
  const [payTo, setPayTo] = useState(route.params?.payTo || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'Food');
  const [date, setDate] = useState(route.params?.date ? new Date(route.params.date) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // Loading state for AI
  
  const [errors, setErrors] = useState({ amount: false, payTo: false });

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Expense' : 'Add Expense' });
  }, [navigation, isEditing]);

  // AI SCANNING LOGIC
  const takePhotoAndScan = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true, // Veryfi needs base64
      maxWidth: 2000,
      maxHeight: 2000,
    };

    const result = await launchCamera(options);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Camera Error', result.errorMessage);
      return;
    }

    const base64Data = result.assets[0].base64;
    setIsScanning(true);

    try {
      const response = await axios.post(
        'https://api.veryfi.com/api/v8/partner/documents',
        {
          file_data: base64Data, //
          file_name: 'receipt.jpg',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'CLIENT-ID': VERYFI_CLIENT_ID,
            'AUTHORIZATION': `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`, //
          },
        }
      );

      const extracted = response.data;
      // Map AI data to form
      if (extracted.total) setAmount(extracted.total.toString());
      if (extracted.vendor?.name) setPayTo(extracted.vendor.name);
      if (extracted.date) setDate(new Date(extracted.date));

      Alert.alert("Success", "Receipt scanned successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Scan Failed", "AI could not read the receipt. Please enter manually.");
    } finally {
      setIsScanning(false);
    }
  };

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
    const expenseData = { amount, payTo, category: selectedCategory, date: date.toISOString() };
    try {
      if (isEditing) {
        await updateExpenseInStorage(editedExpenseId, expenseData, token, userId);
      } else {
        await saveExpensesToStorage(expenseData, token, userId);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Cloud Error', 'Could not save data.');
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
    <ScrollView style={styles.container}>
      {/* AI SCAN BUTTON */}
      <TouchableOpacity 
        style={[styles.scanButton, isScanning && styles.disabledBtn]} 
        onPress={takePhotoAndScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Camera color="white" size={20} style={{marginRight: 10}} />
            <Text style={styles.scanBtnText}>Scan Receipt with AI</Text>
          </>
        )}
      </TouchableOpacity>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    disabledBtn: { backgroundColor: '#A5D6A7' },
    inputWrapper: { marginBottom: 15 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
    errorInput: { borderColor: '#FF3B30', backgroundColor: '#FFF5F5' },
    dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
    dateText: { marginLeft: 10, color: '#333' },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: 40 },
    btn: { backgroundColor: '#007AFF', padding: 15, alignItems: 'center', borderRadius: 6, flex: 1, marginHorizontal: 5 },
    cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' }
});