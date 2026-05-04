import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { bankApi, BankAccount } from '../../api/bank';
import { investmentsApi, Investment } from '../../api/investments';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

const DESTINATIONS = ['ESCROW-FUND-001', 'ESCROW-FUND-002', 'GROWTH-FUND-001'];

const schema = z.object({
  bankAccountId: z.string().min(1, 'Select a bank account'),
  amount: z.number().min(10, 'Minimum $10'),
  destinationAccount: z.string().min(1, 'Select a destination'),
});
type FormData = z.infer<typeof schema>;

export const InvestmentScreen: React.FC = () => {
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState<Investment | null>(null);
  const [customDest, setCustomDest] = useState(false);

  const { data: accounts, isLoading } = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts'],
    queryFn: bankApi.list,
  });

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bankAccountId: '', amount: undefined as any, destinationAccount: '' },
  });

  const selectedBankId = watch('bankAccountId');
  const selectedDest = watch('destinationAccount');
  const selectedBank = accounts?.find((a) => a.id === selectedBankId);

  const investMutation = useMutation({
    mutationFn: investmentsApi.create,
    onSuccess: (data) => { setSuccess(data); setSubmitError(''); reset(); setCustomDest(false); },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner fullScreen message="Loading accounts..." />;

  if (!accounts || accounts.length === 0) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.empty}>
          <Ionicons name="business-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <Text style={s.emptyTitle}>No Bank Accounts</Text>
          <Text style={s.emptyBody}>Link a bank account first to make investments.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {success ? (
          <Card variant="success" style={s.successCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="checkmark-circle" size={16} color="#15803d" style={{ marginRight: 6 }} />
              <Text style={s.successTitle}>Investment Submitted</Text>
            </View>
            {[
              ['Ref', success.txRef],
              ['Amount', `${success.currency} ${success.amount.toLocaleString()}`],
              ['Destination', success.destinationAccount],
              ['Status', success.status],
            ].map(([label, val]) => (
              <View key={label} style={s.detailRow}>
                <Text style={s.detailLabel}>{label}</Text>
                <Text style={[s.detailVal, label === 'Status' && s.pendingStatus]}>{val}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {submitError ? <ErrorMessage message={submitError} /> : null}

        {/* Bank account selector */}
        <Text style={s.sectionLabel}>Bank Account</Text>
        {accounts.map((account) => {
          const selected = selectedBankId === account.id;
          return (
            <TouchableOpacity
              key={account.id}
              onPress={() => setValue('bankAccountId', account.id)}
              style={[s.accountCard, selected && s.accountCardSelected]}
              activeOpacity={0.7}
            >
              <View style={s.accountCardLeft}>
                <View style={[s.bankDot, selected && s.bankDotSelected]}>
                  <Ionicons name="card-outline" size={18} color={selected ? colors.primary : '#64748b'} />
                </View>
                <View>
                  <Text style={[s.bankName, selected && s.bankNameSelected]}>{account.bankName}</Text>
                  <Text style={s.maskedNum}>{account.maskedNumber}</Text>
                </View>
              </View>
              <View style={s.accountCardRight}>
                <Text style={[s.balanceText, selected && s.balanceTextSelected]}>
                  {account.currency} {account.balance.toLocaleString()}
                </Text>
                <Text style={s.accountType}>{account.accountType}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {errors.bankAccountId ? <Text style={s.fieldError}>{errors.bankAccountId.message}</Text> : null}

        {/* Amount */}
        <View style={s.section}>
          <Controller control={control} name="amount" render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={selectedBank ? `Amount (Balance: ${selectedBank.currency} ${selectedBank.balance.toLocaleString()})` : 'Amount (min $10)'}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value ? String(value) : ''}
              onChangeText={(t) => { const n = parseFloat(t); onChange(isNaN(n) ? undefined : n); }}
              onBlur={onBlur}
              error={errors.amount?.message}
              leftElement={<Text style={s.currencySign}>$</Text>}
            />
          )} />
        </View>

        {/* Destination */}
        <Text style={s.sectionLabel}>Destination Fund</Text>
        {DESTINATIONS.map((dest) => {
          const selected = selectedDest === dest && !customDest;
          return (
            <TouchableOpacity
              key={dest}
              onPress={() => { setValue('destinationAccount', dest); setCustomDest(false); }}
              style={[s.destCard, selected && s.destCardSelected]}
              activeOpacity={0.7}
            >
              <View style={[s.destDot, selected && s.destDotSelected]} />
              <Text style={[s.destText, selected && s.destTextSelected]}>{dest}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => { setCustomDest(true); setValue('destinationAccount', ''); }}
          style={[s.destCard, customDest && s.destCardSelected]}
          activeOpacity={0.7}
        >
          <View style={[s.destDot, customDest && s.destDotSelected]} />
          <Text style={[s.destText, customDest && s.destTextSelected]}>Custom destination…</Text>
        </TouchableOpacity>

        {customDest ? (
          <Controller control={control} name="destinationAccount" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={s.customInput}
              placeholder="Enter destination account"
              placeholderTextColor={colors.placeholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
            />
          )} />
        ) : null}
        {errors.destinationAccount ? <Text style={s.fieldError}>{errors.destinationAccount.message}</Text> : null}

        <Button
          title="Submit Investment"
          onPress={handleSubmit((d) => { setSubmitError(''); setSuccess(null); investMutation.mutate(d); })}
          loading={investMutation.isPending}
          size="lg"
          style={s.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  successCard: { marginBottom: 20 },
  successTitle: { fontSize: 15, fontWeight: '700', color: '#15803d' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  pendingStatus: { color: colors.warning, textTransform: 'capitalize' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  accountCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  accountCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  bankDotSelected: { backgroundColor: '#c7d2fe' },
  bankName: { fontSize: 14, fontWeight: '600', color: colors.text },
  bankNameSelected: { color: colors.primaryDark },
  maskedNum: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  accountCardRight: { alignItems: 'flex-end' },
  balanceText: { fontSize: 14, fontWeight: '700', color: colors.text },
  balanceTextSelected: { color: colors.primary },
  accountType: { fontSize: 11, color: colors.textMuted, textTransform: 'capitalize', marginTop: 1 },

  section: { marginTop: 16 },
  currencySign: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  fieldError: { fontSize: 12, color: colors.error, marginTop: -4, marginBottom: 12 },

  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  destCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  destDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12 },
  destDotSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  destText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  destTextSelected: { color: colors.primaryDark, fontWeight: '600' },

  customInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  cta: { marginTop: 20 },
});
