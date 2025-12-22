import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ManagerDashboardScreen({ navigation }: any) {
  const { user, logout, isAdmin, isManager } = useAuth();

  // Redirect based on role
  React.useEffect(() => {
    if (isAdmin()) {
      navigation.replace('AdminDashboard');
    } else if (!isManager()) {
      navigation.replace('UserDashboard');
    }
  }, [isAdmin, isManager, navigation]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const managerFeatures = [
    { title: 'Team Management', icon: 'people', action: () => console.log('Team'), color: '#ff4081' },
    { title: 'Reports', icon: 'analytics', action: () => console.log('Reports'), color: '#9c27b0' },
    { title: 'Tasks', icon: 'clipboard', action: () => console.log('Tasks'), color: '#3f51b5' },
    { title: 'Inventory', icon: 'cube', action: () => console.log('Inventory'), color: '#009688' },
    { title: 'Schedule', icon: 'calendar', action: () => console.log('Schedule'), color: '#ff9800' },
    { title: 'Performance', icon: 'trending-up', action: () => console.log('Performance'), color: '#4caf50' },
  ];

  const teamStats = [
    { title: 'Team Members', value: '15', icon: 'people' },
    { title: 'Active Tasks', value: '28', icon: 'clipboard' },
    { title: 'Completed', value: '142', icon: 'checkmark-circle' },
    { title: 'Pending', value: '8', icon: 'time' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manager Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.personName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Team Overview</Text>
        <View style={styles.statsGrid}>
          {teamStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={28} color="#ff4081" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Management Tools</Text>
        <View style={styles.featuresGrid}>
          {managerFeatures.map((feature, index) => (
            <TouchableOpacity key={index} style={styles.featureCard} onPress={feature.action}>
              <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon as any} size={28} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Manager Responsibilities</Text>
          <Text style={styles.infoText}>
            As a Manager, you can oversee your team, assign tasks, monitor performance, and generate reports. Use the tools above to manage your team effectively.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff4081',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff80',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4081',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: (width - 60) / 3,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});