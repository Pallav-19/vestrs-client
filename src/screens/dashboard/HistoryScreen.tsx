import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { investmentsApi, Investment, InvestmentStatus } from '../../api/investments';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

const PAGE_SIZE = 10;

function statusVariant(status: InvestmentStatus): 'warning' | 'success' | 'error' {
  return status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'warning';
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const HistoryScreen: React.FC = () => {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<Investment[]>([]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['investments', page],
    queryFn: () => investmentsApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  React.useEffect(() => {
    if (data) {
      if (page === 1) setAllItems(data.items);
      else setAllItems((prev) => [...prev, ...data.items]);
    }
  }, [data, page]);

  const handleRefresh = () => { setPage(1); refetch(); };

  if (isLoading && page === 1) return <LoadingSpinner fullScreen message="Loading investments..." />;

  if (error && allItems.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.errorWrap}>
          <ErrorMessage message={getErrorMessage(error)} title="Failed to load investments" />
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
            <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={s.emptyTitle}>No investments yet</Text>
            <Text style={s.emptyBody}>Make your first investment from the Invest tab</Text>
          </View>
        ) : (
          <>
            <Text style={s.count}>{data?.total ?? allItems.length} investments</Text>
            {allItems.map((inv) => (
              <Card key={inv.id} style={s.card}>
                <View style={s.cardTop}>
                  <View>
                    <Text style={s.amount}>{inv.currency} {inv.amount.toLocaleString()}</Text>
                    <Text style={s.destination}>→ {inv.destinationAccount}</Text>
                  </View>
                  <Badge label={inv.status} variant={statusVariant(inv.status)} />
                </View>
                <View style={s.cardBottom}>
                  <Text style={s.txRef}>{inv.txRef}</Text>
                  <Text style={s.date}>{fmtDate(inv.createdAt)}</Text>
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
              <Text style={s.allLoaded}>All {data?.total ?? allItems.length} loaded</Text>
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
  emptyBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  count: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  card: { marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  destination: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  txRef: { fontSize: 11, color: colors.textMuted, fontFamily: 'Courier', flex: 1, marginRight: 8 },
  date: { fontSize: 11, color: colors.textMuted },
  loadMore: { marginTop: 8 },
  allLoaded: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 16 },
});
