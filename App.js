import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Clock, List, Plus, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import RecentExpenses from './screens/RecentExpenses';
import AllExpenses from './screens/AllExpenses';
import ManageExpense from './screens/ManageExpense';
import AuthScreen from './screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// We pass auth info as props to the screens
function ExpensesOverview({ navigation, route }) {
  const { token, userId, onLogout } = route.params;

  return (
    <Tab.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: 'white',
        tabBarStyle: { backgroundColor: '#007AFF' },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'white',
        headerLeft: () => (
          <TouchableOpacity onPress={onLogout} style={{ marginLeft: 15 }}>
            <LogOut color="white" size={20} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <Plus 
            color="white" 
            style={{ marginRight: 15 }} 
            onPress={() => navigation.navigate('ManageExpense')} 
          />
        ),
      }}
    >
      <Tab.Screen 
        name="RecentExpenses" 
        component={RecentExpenses} 
        initialParams={{ token, userId }}
        options={{ 
          title: 'Recent', 
          tabBarIcon: ({color}) => <Clock color={color} size={20}/> 
        }} 
      />
      <Tab.Screen 
        name="AllExpenses" 
        component={AllExpenses} 
        initialParams={{ token, userId }}
        options={{ 
          title: 'All Expenses', 
          tabBarIcon: ({color}) => <List color={color} size={20}/> 
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);

  function authHandler(token, uid) {
    setAuthToken(token);
    setUserId(uid);
  }

  function logoutHandler() {
    setAuthToken(null);
    setUserId(null);
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: 'white',
        }}>
          {!authToken ? (
            // AUTH STACK
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {(props) => <AuthScreen {...props} onAuthenticate={authHandler} />}
            </Stack.Screen>
          ) : (
            // MAIN APP STACK
            <>
              <Stack.Screen 
                name="ExpensesOverview" 
                component={ExpensesOverview} 
                initialParams={{ token: authToken, userId: userId, onLogout: logoutHandler }}
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="ManageExpense" 
                component={ManageExpense} 
                initialParams={{ token: authToken, userId: userId }}
                options={{ 
                  presentation: 'modal', 
                  title: 'Add Expense'
                }} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}