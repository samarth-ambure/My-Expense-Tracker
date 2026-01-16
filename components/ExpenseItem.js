import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Trash2, MapPin, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const ExpenseItem = ({ item, onDelete }) => {
  const navigation = useNavigation();

  function expensePressHandler() {
    navigation.navigate('ManageExpense', {
      expenseId: item.id,
      amount: item.amount,
      payTo: item.payTo
    });
  }

  return (
    <Pressable onPress={expensePressHandler} style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardAmount}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
          <View style={styles.row}><MapPin size={14} color="#666" /><Text style={styles.cardDetail}> {item.payTo}</Text></View>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Trash2 size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#34C759', elevation: 3 },
  cardAmount: { fontSize: 20, fontWeight: 'bold' },
  cardDetail: { color: '#666', fontSize: 14, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pressed: { opacity: 0.75 }
});