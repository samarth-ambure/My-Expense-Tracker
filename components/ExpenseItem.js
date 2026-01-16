import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2, MapPin, Wallet } from 'lucide-react-native';

export const ExpenseItem = ({ item, onDelete }) => (
  <View style={styles.card}>
    <View>
      <Text style={styles.cardAmount}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
      <View style={styles.row}><MapPin size={14} color="#666" /><Text style={styles.cardDetail}> {item.payTo}</Text></View>
      <View style={styles.row}><Wallet size={14} color="#666" /><Text style={styles.cardDetail}> Via: {item.payVia}</Text></View>
    </View>
    <TouchableOpacity onPress={() => onDelete(item.id)}>
      <Trash2 size={20} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#34C759', elevation: 3 },
  cardAmount: { fontSize: 20, fontWeight: 'bold' },
  cardDetail: { color: '#666', fontSize: 14, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 }
});