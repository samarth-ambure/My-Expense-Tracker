import React, { useState, useLayoutEffect } from 'react';
import { 
  View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, 
  ScrollView, Alert, ActivityIndicator, ToastAndroid, Image 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { saveExpensesToStorage, updateExpenseInStorage } from '../utils/storage';
import { Calendar, Camera, Trash2, ChevronDown } from 'lucide-react-native';

// VERYFI CREDENTIALS
const VERYFI_CLIENT_ID = 'vrfZW5dvbTe8xsnNno6r9lzF12W3G7dSpXrZhYe'; 
const VERYFI_USERNAME = 'samarthambure08';
const VERYFI_API_KEY = '59526137528996c2b36cc597e8ccb2da';

// EXPANDED CATEGORY LIST
const CATEGORIES = [
  'Food & Drinks', 
  'Shopping', 
  'Transportation', 
  'Bills & Utilities', 
  'Entertainment', 
  'Health', 
  'Education', 
  'Electronics',
  'Personal Care',
  'Others'
];

export default function ManageExpense({ route, navigation }) {
  const { token, userId } = route.params; 
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [amount, setAmount] = useState(route.params?.amount || '');
  const [payTo, setPayTo] = useState(route.params?.payTo || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'Food & Drinks');
  const [date, setDate] = useState(route.params?.date ? new Date(route.params.date) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 
  const [previewImage, setPreviewImage] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Expense' : 'Add Expense' });
  }, [navigation, isEditing]);

  const openCategoryPicker = () => {
    Alert.alert(
      "Select Category",
      "Choose the type of expense:",
      CATEGORIES.map(cat => ({
        text: cat,
        onPress: () => setSelectedCategory(cat)
      })).concat([{ text: "Cancel", style: "cancel" }])
    );
  };

  const processImageForAI = async (result) => {
    if (result.canceled) return;
    const base64Data = result.assets[0].base64;
    setPreviewImage(result.assets[0].uri);
    setIsScanning(true);

    try {
      const response = await axios.post(
        'https://api.veryfi.com/api/v8/partner/documents',
        { file_data: base64Data, file_name: 'receipt.jpg' },
        {
          headers: {
            'Content-Type': 'application/json',
            'CLIENT-ID': VERYFI_CLIENT_ID,
            'AUTHORIZATION': `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`,
          },
        }
      );

      const extracted = response.data;
      if (extracted.total) setAmount(extracted.total.toString());
      if (extracted.vendor?.name) setPayTo(extracted.vendor.name);
      
      // IMPROVED AUTO-DETECT LOGIC
      if (extracted.category) {
        const aiCat = extracted.category.toLowerCase();
        const match = CATEGORIES.find(c => {
          const local = c.toLowerCase();
          return aiCat.includes(local) || local.includes(aiCat);
        });
        if (match) setSelectedCategory(match);
      }
      
      if (Platform.OS === 'android') {
        ToastAndroid.show("AI Scan Complete!", ToastAndroid.SHORT);
      }
    } catch (error) {
      Alert.alert("Scan Failed", "AI could not read this image.");
    } finally {
      setIsScanning(false);
    }
  };

  const pickImageSource = () => {
    Alert.alert("Scan Receipt", "Choose source:", [
      { text: "📷 Camera", onPress: async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (granted) processImageForAI(await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, allowsEditing: true }));
      }},
      { text: "🖼️ Gallery", onPress: async () => {
        processImageForAI(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.7, allowsEditing: true }));
      }},
      { text: "Cancel", style: "cancel" }
    ]);
  };

  async function confirmHandler() {
    const isAmountValid = !isNaN(amount) && amount.trim().length > 0 && parseFloat(amount) > 0;
    const isPayToValid = payTo.trim().length > 0;
    if (!isAmountValid || !isPayToValid) {
        Alert.alert('Invalid Input', 'Check your amount and destination.');
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
      Alert.alert('Error', 'Save failed.');
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {previewImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImg} onPress={() => setPreviewImage(null)}>
            <Trash2 color="white" size={16} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.scanButton, isScanning && styles.disabledBtn]} onPress={pickImageSource} disabled={isScanning}>
          {isScanning ? <ActivityIndicator color="white" /> : (
            <>
              <Camera color="white" size={20} style={{marginRight: 10}} />
              <Text style={styles.scanBtnText}>Scan Receipt with AI</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={styles.selector} onPress={openCategoryPicker}>
        <Text style={styles.selectorText}>{selectedCategory}</Text>
        <ChevronDown size={20} color="#8E8E93" />
      </TouchableOpacity>

      <Text style={styles.label}>Amount (₹)</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#C7C7CC" />
      </View>

      <Text style={styles.label}>Merchant / Payee</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="e.g. D-Mart" value={payTo} onChangeText={setPayTo} placeholderTextColor="#C7C7CC" />
      </View>
      
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
        <Calendar size={20} color="#8E8E93" />
        <Text style={styles.dateText}>{date.toLocaleDateString('en-IN')}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }} maximumDate={new Date()} />
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={confirmHandler}>
          <Text style={styles.saveText}>{isEditing ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  label: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  scanButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 4 },
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabledBtn: { backgroundColor: '#A2CFFE' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, marginBottom: 15 },
  selectorText: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  previewContainer: { position: 'relative', marginBottom: 25, alignItems: 'center' },
  imagePreview: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#F2F2F7' },
  removeImg: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FF3B30', padding: 8, borderRadius: 20 },
  inputWrapper: { marginBottom: 15 },
  input: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, fontSize: 16, color: '#1C1C1E' },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, marginBottom: 25 },
  dateText: { marginLeft: 12, fontSize: 16, color: '#1C1C1E' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 40 },
  btn: { backgroundColor: '#007AFF', padding: 16, alignItems: 'center', borderRadius: 12, flex: 1, marginHorizontal: 6 },
  cancel: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#007AFF' },
  cancelText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  saveText: { color: 'white', fontWeight: '600', fontSize: 16 }
});