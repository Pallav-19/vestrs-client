import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { bankApi, BankAccount } from '../../api/bank';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

function randomToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function StepIndicator() {
  return (
    <View style={si.row}>
      {[
        { label: 'Identity', done: true },
        { label: 'Accreditation', done: true },
        { label: 'Bank', active: true },
      ].map((step, i) => (
        <View key={step.label} style={si.stepWrap}>
          <View style={[si.circle, step.active && si.circleActive, step.done && si.circleDone]}>
            {step.done ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : (
              <Text style={[si.num, step.active && si.numActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[si.label, step.active && si.labelActive]}>{step.label}</Text>
          {i < 2 ? <View style={[si.line, step.done && si.lineDone]} /> : null}
        </View>
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 20, paddingHorizontal: 24 },
  stepWrap: { alignItems: 'center', flex: 1, position: 'relative' },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  circleActive: { backgroundColor: colors.primary },
  circleDone: { backgroundColor: '#10b981' },
  num: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  numActive: { color: '#fff' },
  label: { fontSize: 10, color: '#94a3b8', fontWeight: '500', textAlign: 'center' },
  labelActive: { color: colors.primary, fontWeight: '700' },
  line: { position: 'absolute', top: 16, left: '60%', right: '-60%', height: 2, backgroundColor: '#e2e8f0', zIndex: -1 },
  lineDone: { backgroundColor: '#10b981' },
});

export const BankLinkScreen: React.FC = () => {
  const { setUser } = useAuthStore();
  const [linkError, setLinkError] = useState('');
  const [justLinked, setJustLinked] = useState<BankAccount | null>(null);

  const { data: accounts, isLoading: accountsLoading, refetch } = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts'],
    queryFn: bankApi.list,
  });

  const linkMutation = useMutation({
    mutationFn: bankApi.link,
    onSuccess: async (data) => {
      setJustLinked(data);
      setLinkError('');
      await refetch();
    },
    onError: (err) => setLinkError(getErrorMessage(err)),
  });

  const unlinkMutation = useMutation({
    mutationFn: bankApi.unlink,
    onSuccess: () => { setJustLinked(null); refetch(); },
    onError: (err) => Alert.alert('Error', getErrorMessage(err)),
  });

  const handleConnect = () => {
    setLinkError('');
    setJustLinked(null);
    linkMutation.mutate({
      publicToken: randomToken(),
      accountId: `acc_${randomToken().slice(0, 10)}`,
    });
  };

  const handleUnlink = (account: BankAccount) => {
    Alert.alert(
      'Remove account',
      `Remove ${account.bankName} (${account.maskedNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => unlinkMutation.mutate(account.id) },
      ]
    );
  };

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <StepIndicator />

        <View style={s.hero}>
          <View style={s.iconWrap}>
            <Ionicons name="business-outline" size={40} color={colors.primary} />
          </View>
          <Text style={s.title}>Link Bank Account</Text>
          <Text style={s.subtitle}>
            Connect your bank securely to fund your investments.
          </Text>
        </View>

        {linkError ? <ErrorMessage message={linkError} /> : null}

        {justLinked ? (
          <Card variant="success" style={s.card}>
            <View style={s.successHeader}>
              <Ionicons name="checkmark-circle" size={16} color="#15803d" style={{ marginRight: 6 }} />
              <Text style={s.successTitle}>Bank Connected</Text>
            </View>
            <View style={s.detailRows}>
              {[
                ['Bank', justLinked.bankName],
                ['Account', justLinked.maskedNumber],
                ['Type', justLinked.accountType],
                ['Balance', `${justLinked.currency} ${justLinked.balance.toLocaleString()}`],
              ].map(([label, val]) => (
                <View key={label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{label}</Text>
                  <Text style={s.detailVal}>{val}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Connect button — simulates opening a Plaid widget */}
        <TouchableOpacity
          onPress={handleConnect}
          disabled={linkMutation.isPending}
          style={[s.connectBtn, linkMutation.isPending && s.connectBtnDisabled]}
          activeOpacity={0.85}
        >
          {linkMutation.isPending ? (
            <LoadingSpinner size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="link-outline" size={22} color="#fff" />
              <Text style={s.connectText}>Connect your bank</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={s.secureRow}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
          <Text style={s.secureNote}>Secured by bank-grade encryption</Text>
        </View>

        {accountsLoading && !hasAccounts ? (
          <LoadingSpinner message="Loading accounts..." />
        ) : null}

        {hasAccounts ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Connected Accounts</Text>
            {accounts.map((account) => (
              <Card key={account.id} style={s.accountCard}>
                <View style={s.accountRow}>
                  <View style={s.bankAvatar}>
                    <Text style={s.bankAvatarText}>
                      {account.bankName.charAt(0)}
                    </Text>
                  </View>
                  <View style={s.accountInfo}>
                    <Text style={s.bankName}>{account.bankName}</Text>
                    <Text style={s.maskedNumber}>{account.maskedNumber} · {account.accountType}</Text>
                    <Text style={s.balance}>
                      {account.currency} {account.balance.toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnlink(account)}
                    disabled={unlinkMutation.isPending}
                    style={s.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={s.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            <Button
              title="Continue to Dashboard →"
              onPress={() => authApi.getMe().then(setUser)}
              size="lg"
              style={s.continueBtn}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 56 },

  hero: { alignItems: 'center', marginBottom: 28 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20, paddingHorizontal: 16 },

  card: { marginBottom: 20 },
  successHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  successTitle: { fontSize: 14, fontWeight: '700', color: '#15803d' },
  detailRows: { gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailVal: { fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },

  connectBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  connectBtnDisabled: { opacity: 0.7 },
  connectText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 28 },
  secureNote: { fontSize: 12, color: colors.textMuted },

  section: {},
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },

  accountCard: { marginBottom: 10 },
  accountRow: { flexDirection: 'row', alignItems: 'center' },
  bankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  accountInfo: { flex: 1 },
  bankName: { fontSize: 15, fontWeight: '700', color: colors.text },
  maskedNumber: { fontSize: 12, color: colors.textSecondary, marginTop: 1, textTransform: 'capitalize' },
  balance: { fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: 3 },

  removeBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  removeBtnText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },

  continueBtn: { marginTop: 16 },
});
