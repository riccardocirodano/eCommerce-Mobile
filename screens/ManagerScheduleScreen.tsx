import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { managerService } from '../services/manager.service';

export default function ManagerScheduleScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<any>(null);

  const entries: any[] = payload?.Schedule ?? payload?.schedule ?? payload ?? [];

  const formatDateTime = (value: any): string | null => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  };

  const getPrimaryText = (e: any): string =>
    e?.title ?? e?.name ?? e?.shiftName ?? e?.eventName ?? e?.id ?? e?.scheduleId ?? 'Schedule Entry';

  const getSecondaryText = (e: any): string => {
    const start = formatDateTime(e?.startTime ?? e?.start ?? e?.from ?? e?.startDate);
    const end = formatDateTime(e?.endTime ?? e?.end ?? e?.to ?? e?.endDate);
    const assigned = e?.assignedTo ?? e?.assignee ?? e?.employeeName ?? e?.userName;
    const parts = [start && end ? `${start} → ${end}` : start ? `Start: ${start}` : null, assigned ? `Assigned: ${assigned}` : null].filter(Boolean);
    return parts.join(' • ');
  };

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await managerService.getSchedule();
        if (!isMounted) return;
        setPayload(data);
      } catch (e: any) {
        if (!isMounted) return;
        setPayload(null);
        setError(e?.message ?? 'Failed to load schedule.');
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
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Schedule</Text>
        {isLoading ? (
          <Text style={styles.subtitle}>Loading…</Text>
        ) : error ? (
          <Text style={styles.subtitle}>Error: {error}</Text>
        ) : (
          <>
            {Array.isArray(entries) && entries.length ? (
              entries.map((e, idx) => (
                <View key={e?.id ?? e?.scheduleId ?? idx} style={styles.row}>
                  <Text style={styles.rowTitle}>{getPrimaryText(e)}</Text>
                  {!!getSecondaryText(e) && <Text style={styles.rowSub}>{getSecondaryText(e)}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.subtitle}>No schedule entries available.</Text>
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
