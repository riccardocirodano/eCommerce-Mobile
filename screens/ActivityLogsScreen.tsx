import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { adminService, ActivityLog, PaginatedResponse } from '../services/admin.service';

export default function ActivityLogsScreen({ navigation }: any) {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigation.replace('UserDashboard');
      return;
    }
    load();
  }, [isAdmin, navigation, page]);

  const load = async () => {
    try {
      setIsLoading(true);
      const response: PaginatedResponse<ActivityLog> = await adminService.getActivityLogs(page, pageSize);
      setData(response.data ?? []);
      setTotalPages(response.pagination?.totalPages ?? 1);
    } catch (e) {
      console.error('Failed to load activity logs:', e);
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ActivityLog }) => {
    const ts = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.action ?? ''}</Text>
          <Text style={styles.time}>{ts}</Text>
        </View>
        <Text style={styles.subtitle}>{item.adminName ?? ''}</Text>
        {!!item.details && <Text style={styles.details}>{item.details}</Text>}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading activity logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Logs</Text>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No activity logs</Text>}
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.disabled]}
            onPress={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <Text style={styles.pageText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageButton, page === totalPages && styles.disabled]}
            onPress={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <Text style={styles.pageText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#666' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1, paddingRight: 12 },
  time: { fontSize: 12, color: '#999' },
  subtitle: { marginTop: 6, fontSize: 13, color: '#666' },
  details: { marginTop: 6, fontSize: 13, color: '#333' },
  empty: { color: '#666' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pageButton: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  disabled: { backgroundColor: '#ccc' },
  pageText: { color: '#fff', fontWeight: 'bold' },
  pageInfo: { color: '#666' },
});