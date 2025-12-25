import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { managerService } from '../services/manager.service';

export default function ManagerTasksScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<any>(null);

  const tasks: any[] = payload?.Tasks ?? payload?.tasks ?? payload ?? [];

  const getPrimaryText = (t: any): string =>
    t?.title ?? t?.name ?? t?.taskName ?? t?.taskTitle ?? t?.id ?? t?.taskId ?? 'Task';

  const getSecondaryText = (t: any): string => {
    const due = t?.dueDate ?? t?.dueOn;
    const status = t?.status ?? t?.state;
    const priority = t?.priority;
    const parts = [due ? `Due: ${due}` : null, status ? `Status: ${status}` : null, priority ? `Priority: ${priority}` : null].filter(Boolean);
    return parts.join(' • ');
  };

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await managerService.getTasks();
        if (!isMounted) return;
        setPayload(data);
      } catch (e: any) {
        if (!isMounted) return;
        setPayload(null);
        setError(e?.message ?? 'Failed to load tasks.');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tasks</Text>
        {isLoading ? (
          <Text style={styles.subtitle}>Loading…</Text>
        ) : error ? (
          <Text style={styles.subtitle}>Error: {error}</Text>
        ) : (
          <>
            {Array.isArray(tasks) && tasks.length ? (
              tasks.map((t, idx) => (
                <View key={t?.id ?? t?.taskId ?? idx} style={styles.row}>
                  <Text style={styles.rowTitle}>{getPrimaryText(t)}</Text>
                  {!!getSecondaryText(t) && <Text style={styles.rowSub}>{getSecondaryText(t)}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.subtitle}>No tasks available.</Text>
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
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
});
