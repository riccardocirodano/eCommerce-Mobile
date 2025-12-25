import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import ManagerTeamManagementScreen from '../screens/ManagerTeamManagementScreen';
import ManagerReportsScreen from '../screens/ManagerReportsScreen';
import ManagerTasksScreen from '../screens/ManagerTasksScreen';
import ManagerInventoryScreen from '../screens/ManagerInventoryScreen';
import ManagerScheduleScreen from '../screens/ManagerScheduleScreen';
import ManagerPerformanceScreen from '../screens/ManagerPerformanceScreen';
import ManagerMyProfileScreen from '../screens/ManagerMyProfileScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import ActivityLogsScreen from '../screens/ActivityLogsScreen';
import SystemSettingsScreen from '../screens/SystemSettingsScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#050404ff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="UserDashboard" 
            component={UserDashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ManagerDashboard" 
            component={ManagerDashboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ManagerTeamManagement"
            component={ManagerTeamManagementScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerReports"
            component={ManagerReportsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerTasks"
            component={ManagerTasksScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerInventory"
            component={ManagerInventoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerSchedule"
            component={ManagerScheduleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerPerformance"
            component={ManagerPerformanceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManagerMyProfile"
            component={ManagerMyProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="UserManagement" 
            component={UserManagementScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ActivityLogs" 
            component={ActivityLogsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="SystemSettings" 
            component={SystemSettingsScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});