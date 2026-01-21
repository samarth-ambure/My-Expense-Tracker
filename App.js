import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Clock, List, Plus, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';

import RecentExpenses from './screens/RecentExpenses';
import AllExpenses from './screens/AllExpenses';
import ManageExpense from './screens/ManageExpense';
import AuthScreen from './screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExpensesOverview({ navigation, route }) {
  const { token, userId } = route.params;

  // This handles the logout without passing functions through params
  const logoutHandler = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "No" },
      { text: "Yes", onPress: () => navigation.navigate('Auth', { logout: true }) }
    ]);
  };

  return (
    <Tab.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: 'white',
        tabBarStyle: { backgroundColor: '#007AFF' },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'white',
        headerLeft: () => (
          <TouchableOpacity onPress={logoutHandler} style={{ marginLeft: 15 }}>
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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: 'white',
        }}>
          {!authToken ? (
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {(props) => {
                // If we returned here via logout navigation, clear the state
                if (props.route.params?.logout) {
                  setAuthToken(null);
                  setUserId(null);
                }
                return <AuthScreen {...props} onAuthenticate={authHandler} />;
              }}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen 
                name="ExpensesOverview" 
                component={ExpensesOverview} 
                initialParams={{ token: authToken, userId: userId }}
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