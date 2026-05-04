import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { auditApi, AuditEntry, AuditStatus } from '../../api/audit';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

const PAGE_SIZE = 10;

function statusVariant(s: AuditStatus): 'success' | 'error' | 'warning' {
  return s === 'success' ? 'success' : s === 'failure' ? 'error' : 'warning';
}

function fmtAction(action: string) {
  return action.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function metaSummary(meta?: Record<string, unknown>) {
  if (!meta) return '';
  const keys = Object.keys(meta).slice(0, 3);
  return keys.map((k) => `${k}: ${String(meta[k]).substring(0, 24)}`).join(' · ');
}

export const AuditScreen: React.FC = () => {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<AuditEntry[]>([]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['audit', page],
    queryFn: () => auditApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  React.useEffect(() => {
    if (data) {
      if (page === 1) setAllItems(data.items);
      else setAllItems((prev) => [...prev, ...data.items]);
    }
  }, [data, page]);

  const handleRefresh = () => { setPage(1); refetch(); };

  if (isLoading && page === 1) return <LoadingSpinner fullScreen message="Loading audit log..." />;

  if (error && allItems.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.errorWrap}>
          <ErrorMessage message={getErrorMessage(error)} title="Failed to load audit log" />
          <Button title="Retry" onPress={handleRefresh} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading && page === 1} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {allItems.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={s.emptyTitle}>No audit entries</Text>
            <Text style={s.emptyBody}>Activity logs will appear here</Text>
          </View>
        ) : (
          <>
            <Text style={s.count}>{data?.total ?? allItems.length} entries</Text>
            {allItems.map((entry) => (
              <Card key={entry.id} style={s.card}>
                <View style={s.cardRow}>
                  <View style={s.actionWrap}>
                    <Text style={s.action}>{fmtAction(entry.action)}</Text>
                    {metaSummary(entry.metadata) ? (
                      <Text style={s.meta} numberOfLines={1}>{metaSummary(entry.metadata)}</Text>
                    ) : null}
                    <Text style={s.date}>{fmtDate(entry.createdAt)}</Text>
                  </View>
                  <Badge label={entry.status} variant={statusVariant(entry.status)} />
                </View>
              </Card>
            ))}

            {data?.hasMore ? (
              <Button
                title="Load more"
                onPress={() => { if (!isFetching) setPage((p) => p + 1); }}
                loading={isFetching && page > 1}
                variant="outline"
                style={s.loadMore}
              />
            ) : allItems.length > 0 ? (
              <Text style={s.allLoaded}>All {data?.total ?? allItems.length} entries loaded</Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  errorWrap: { padding: 24 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  count: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  card: { marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  actionWrap: { flex: 1, marginRight: 12 },
  action: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 3 },
  meta: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  date: { fontSize: 11, color: colors.textMuted },
  loadMore: { marginTop: 8 },
  allLoaded: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 16 },
});
