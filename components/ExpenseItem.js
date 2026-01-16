import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Trash2, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const ExpenseItem = ({ item, onDelete }) => {
  const navigation = useNavigation();

  function expensePressHandler() {
    // Ensure the name 'ManageExpense' matches your Stack.Screen name in App.js
    navigation.navigate('ManageExpense', {
      expenseId: item.id,
      amount: item.amount,
      payTo: item.payTo,
      category: item.category,
      date: item.date
    });
  }

  // Safe date formatting to prevent 500/Crash errors
  const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'N/A';

  return (
    <Pressable 
      onPress={expensePressHandler} 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.cardAmount}>₹{parseFloat(item.amount || 0).toLocaleString('en-IN')}</Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.row}>
            <MapPin size={14} color="#666" />
            <Text style={styles.cardDetail}>{item.payTo}</Text>
          </View>
          
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
          <Trash2 size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderLeftWidth: 5, 
    borderLeftColor: '#34C759', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  categoryBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  cardDetail: { color: '#666', fontSize: 14, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dateText: { fontSize: 11, color: '#999', marginTop: 8 },
  deleteBtn: { padding: 8 },
  pressed: { opacity: 0.7 }
});