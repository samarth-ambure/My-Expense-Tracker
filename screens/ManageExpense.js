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

const VERYFI_CLIENT_ID = 'vrfZW5dvbTe8xsnNno6r9lzF12W3G7dSpXrZhYe'; 
const VERYFI_USERNAME = 'samarthambure08';
const VERYFI_API_KEY = '59526137528996c2b36cc597e8ccb2da';

// List of available categories
const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Bills', 'Education', 'Health', 'Others'];

export default function ManageExpense({ route, navigation }) {
  const { token, userId } = route.params; 
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [amount, setAmount] = useState(route.params?.amount || '');
  const [payTo, setPayTo] = useState(route.params?.payTo || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'Food');
  const [date, setDate] = useState(route.params?.date ? new Date(route.params.date) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 
  const [previewImage, setPreviewImage] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Expense' : 'Add Expense' });
  }, [navigation, isEditing]);

  // CATEGORY PICKER MENU
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
      
      // AUTO-DETECT CATEGORY LOGIC
      if (extracted.category) {
        // Find if the AI category matches any in our local list
        const match = CATEGORIES.find(c => 
          extracted.category.toLowerCase().includes(c.toLowerCase())
        );
        if (match) setSelectedCategory(match);
      }
      
      if (Platform.OS === 'android') {
        ToastAndroid.show("AI Scan & Auto-Category Complete!", ToastAndroid.LONG);
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

  return (
    <ScrollView style={styles.container}>
      {previewImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImg} onPress={() => setPreviewImage(null)}><Trash2 color="white" size={16} /></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.scanButton, isScanning && styles.disabledBtn]} onPress={pickImageSource} disabled={isScanning}>
          {isScanning ? <ActivityIndicator color="white" /> : <><Camera color="white" size={20} style={{marginRight: 10}} /><Text style={styles.scanBtnText}>Scan Receipt with AI</Text></>}
        </TouchableOpacity>
      )}

      {/* RESTORED CATEGORY SELECTOR */}
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={styles.selector} onPress={openCategoryPicker}>
        <Text style={styles.selectorText}>{selectedCategory}</Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.label}>Details</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="Where to pay?" value={payTo} onChangeText={setPayTo} />
      </View>
      
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
        <Calendar size={20} color="#666" />
        <Text style={styles.dateText}>{date.toLocaleDateString('en-IN')}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }} />
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => navigation.goBack()}><Text>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => {/* your confirmHandler logic here */}}><Text style={{color:'white'}}>Save</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F8F9FA' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8, marginTop: 10 },
    scanButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    scanBtnText: { color: 'white', fontWeight: 'bold' },
    selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 },
    selectorText: { fontSize: 16, color: '#333' },
    previewContainer: { position: 'relative', marginBottom: 20, alignItems: 'center' },
    imagePreview: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#EEE' },
    removeImg: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF3B30', padding: 8, borderRadius: 20 },
    inputWrapper: { marginBottom: 15 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
    dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
    dateText: { marginLeft: 10 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 40 },
    btn: { backgroundColor: '#007AFF', padding: 15, alignItems: 'center', borderRadius: 6, flex: 1, marginHorizontal: 5 },
    cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' }
});