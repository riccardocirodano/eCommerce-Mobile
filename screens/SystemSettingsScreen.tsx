import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { adminService, SystemSettings } from '../services/admin.service';

export default function SystemSettingsScreen({ navigation }: any) {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigation.replace('UserDashboard');
      return;
    }
    load();
  }, [isAdmin, navigation]);

  const load = async () => {
    try {
      setIsLoading(true);
      const s = await adminService.getSystemSettings();
      setSettings(s);
    } catch (e) {
      console.error('Failed to load system settings:', e);
      Alert.alert('Error', 'Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!settings ? (
          <Text style={styles.empty}>No settings available</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Application</Text>
            <Row label="Name" value={settings.applicationName ?? ''} />
            <Row label="Version" value={settings.version ?? ''} />
            <Row label="Environment" value={settings.environment ?? ''} />

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Security</Text>
            <Row label="Password min length" value={String(settings.securitySettings?.passwordMinLength ?? '')} />
            <Row label="Require email confirmation" value={String(settings.securitySettings?.requireEmailConfirmation ?? '')} />
            <Row label="Session timeout (min)" value={String(settings.securitySettings?.sessionTimeoutMinutes ?? '')} />

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Max Users Per Role</Text>
            {settings.maxUsersPerRole
              ? Object.entries(settings.maxUsersPerRole).map(([k, v]) => (
                  <Row key={k} label={k} value={String(v)} />
                ))
              : <Text style={styles.empty}>No role limits</Text>
            }
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { color: '#666', fontSize: 14, flex: 1, paddingRight: 12 },
  value: { color: '#333', fontSize: 14, fontWeight: '500' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#666' },
  empty: { color: '#666' },
});