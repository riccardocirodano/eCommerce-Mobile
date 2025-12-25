import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { managerService } from '../services/manager.service';

export default function ManagerTeamManagementScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await managerService.getTeam(1, 20);
        if (!isMounted) return;
        setPayload(data);
      } catch (e: any) {
        if (!isMounted) return;
        setPayload(null);
        setError(e?.message ?? 'Failed to load team.');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const users: any[] = payload?.Users ?? payload?.users ?? payload?.data ?? [];
  const pagination = payload?.Pagination ?? payload?.pagination;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Team Management</Text>
        {isLoading ? (
          <Text style={styles.subtitle}>Loading…</Text>
        ) : error ? (
          <Text style={styles.subtitle}>Error: {error}</Text>
        ) : (
          <>
            {pagination ? (
              <Text style={styles.subtitle}>
                Page {pagination?.CurrentPage ?? pagination?.currentPage} • Total {pagination?.TotalCount ?? pagination?.totalCount}
              </Text>
            ) : null}

            {Array.isArray(users) && users.length ? (
              users.map((u, idx) => (
                <View key={u?.userID ?? u?.userId ?? idx} style={styles.row}>
                  <Text style={styles.rowTitle}>{u?.personName ?? u?.email ?? '—'}</Text>
                  <Text style={styles.rowSub}>{u?.email ?? ''}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.subtitle}>No team members found.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff4081',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    lineHeight: 20,
  },
  row: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rowSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
