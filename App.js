import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Clock, List, Plus } from 'lucide-react-native';

import RecentExpenses from './screens/RecentExpenses';
import AllExpenses from './screens/AllExpenses';
import ManageExpense from './screens/ManageExpense';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExpensesOverview() {
  return (
    <Tab.Navigator 
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: 'white',
        tabBarStyle: { backgroundColor: '#007AFF' },
        tabBarActiveTintColor: '#FFD700', // Gold color for active tab
        tabBarInactiveTintColor: 'white', // FIXED: Removed the #
        headerRight: () => (
          <Plus 
            color="white" 
            style={{ marginRight: 15 }} 
            onPress={() => navigation.navigate('ManageExpense')} 
          />
        ),
      })}
    >
      <Tab.Screen 
        name="RecentExpenses" 
        component={RecentExpenses} 
        options={{ 
          title: 'Recent', 
          tabBarIcon: ({color}) => <Clock color={color} size={20}/> 
        }} 
      />
      <Tab.Screen 
        name="AllExpenses" 
        component={AllExpenses} 
        options={{ 
          title: 'All Expenses', 
          tabBarIcon: ({color}) => <List color={color} size={20}/> 
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="ExpensesOverview" 
            component={ExpensesOverview} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ManageExpense" 
            component={ManageExpense} 
            options={{ 
              presentation: 'modal', 
              title: 'Add Expense',
              headerStyle: { backgroundColor: '#007AFF' },
              headerTintColor: 'white'
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}