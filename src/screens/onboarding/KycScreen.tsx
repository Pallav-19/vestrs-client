import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { kycApi, KycStatusResponse } from '../../api/kyc';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Identity', 'Accreditation', 'Bank'];
  return (
    <View style={si.row}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <View key={label} style={si.stepWrap}>
            <View style={[si.circle, active && si.circleActive, done && si.circleDone]}>
              {done ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={[si.stepNum, active && si.stepNumActive]}>{n}</Text>
              )}
            </View>
            <Text style={[si.stepLabel, active && si.stepLabelActive]}>{label}</Text>
            {i < steps.length - 1 ? (
              <View style={[si.line, done && si.lineDone]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  stepWrap: { alignItems: 'center', flex: 1, position: 'relative' },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  circleActive: { backgroundColor: colors.primary },
  circleDone: { backgroundColor: '#10b981' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500', textAlign: 'center' },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  line: { position: 'absolute', top: 16, left: '60%', right: '-60%', height: 2, backgroundColor: '#e2e8f0', zIndex: -1 },
  lineDone: { backgroundColor: '#10b981' },
});

export const KycScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [initiateError, setInitiateError] = useState('');
  const [retryError, setRetryError] = useState('');

  const step = user?.onboardingStep;
  const isPolling = step === 'KYC_INITIATED';

  const { data: kycStatus } = useQuery<KycStatusResponse>({
    queryKey: ['kyc-status'],
    queryFn: kycApi.getStatus,
    enabled: isPolling,
    refetchInterval: isPolling ? 5000 : false,
  });

  useEffect(() => {
    if (!isPolling || !kycStatus) return;
    if (kycStatus.status === 'success' || kycStatus.status === 'failure') {
      authApi.getMe().then(setUser);
    }
  }, [kycStatus?.status]);

  const initiateMutation = useMutation({
    mutationFn: kycApi.initiate,
    onSuccess: () => authApi.getMe().then(setUser),
    onError: (err) => setInitiateError(getErrorMessage(err)),
  });

  const retryMutation = useMutation({
    mutationFn: kycApi.retry,
    onSuccess: () => { setRetryError(''); authApi.getMe().then(setUser); },
    onError: (err) => setRetryError(getErrorMessage(err)),
  });

  const SubResult = ({ label, result }: { label: string; result?: { status: string } }) => {
    if (!result) return null;
    const variant = result.status === 'passed' ? 'success' : result.status === 'failed' ? 'error' : 'warning';
    return (
      <View style={s.subRow}>
        <Text style={s.subLabel}>{label}</Text>
        <Badge label={result.status} variant={variant} />
      </View>
    );
  };

  if (step === 'REGISTERED') {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={1} />
          <View style={s.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
          </View>
          <Text style={s.title}>Identity Verification</Text>
          <Text style={s.subtitle}>We need to verify your identity before you can invest. This usually takes a few minutes.</Text>

          <Card style={s.infoCard}>
            <Text style={s.infoTitle}>What we check</Text>
            {[
              { icon: 'card-outline', text: 'Government ID (CKYC)' },
              { icon: 'person-outline', text: 'Identity verification' },
              { icon: 'shield-outline', text: 'AML screening' },
            ].map(({ icon, text }) => (
              <View key={text} style={s.infoRow}>
                <Ionicons name={icon as any} size={16} color="#10b981" style={{ marginRight: 10 }} />
                <Text style={s.infoItem}>{text}</Text>
              </View>
            ))}
          </Card>

          {initiateError ? <ErrorMessage message={initiateError} /> : null}

          <Button
            title="Start Identity Verification"
            onPress={() => { setInitiateError(''); initiateMutation.mutate(); }}
            loading={initiateMutation.isPending}
            size="lg"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'KYC_INITIATED') {
    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.scrollCenter} showsVerticalScrollIndicator={false}>
          <StepIndicator current={1} />
          <LoadingSpinner size="large" />
          <Text style={s.title}>Verifying your identity…</Text>
          <Text style={s.subtitle}>Usually takes a few minutes. We'll update automatically.</Text>
          {kycStatus?.subResults ? (
            <Card style={s.statusCard}>
              <Text style={s.cardTitle}>Verification Progress</Text>
              <SubResult label="CKYC Check" result={kycStatus.subResults.ckyc} />
              <SubResult label="Identity" result={kycStatus.subResults.identity} />
              <SubResult label="AML Screening" result={kycStatus.subResults.aml} />
            </Card>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'KYC_FAILED') {
    const attempts = (kycStatus as any)?.attemptCount ?? 0;
    const max = (kycStatus as any)?.maxAttempts ?? 3;
    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator current={1} />
          <View style={[s.iconWrap, s.iconError]}>
            <Ionicons name="close-circle-outline" size={40} color={colors.error} />
          </View>
          <Text style={s.title}>Verification Failed</Text>

          <Card variant="error" style={s.statusCard}>
            <Text style={s.errorTitle}>What went wrong</Text>
            <Text style={s.errorBody}>{(kycStatus as any)?.message || 'Your identity could not be verified.'}</Text>
            {attempts > 0 ? <Text style={s.attempts}>Attempts: {attempts}/{max}</Text> : null}
          </Card>

          {kycStatus?.subResults ? (
            <Card style={s.statusCard}>
              <Text style={s.cardTitle}>Check Results</Text>
              <SubResult label="CKYC Check" result={kycStatus.subResults.ckyc} />
              <SubResult label="Identity" result={kycStatus.subResults.identity} />
              <SubResult label="AML Screening" result={kycStatus.subResults.aml} />
            </Card>
          ) : null}

          {retryError ? <ErrorMessage message={retryError} /> : null}

          {attempts < max ? (
            <Button
              title={`Retry Verification (${attempts}/${max} used)`}
              onPress={() => { setRetryError(''); retryMutation.mutate(); }}
              loading={retryMutation.isPending}
              size="lg"
            />
          ) : (
            <Card variant="warning">
              <Text style={s.warningTitle}>Maximum attempts reached</Text>
              <Text style={s.warningBody}>Contact support@vestrs.com for assistance.</Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'KYC_SUCCESS') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.successWrap}>
          <View style={[s.iconWrap, s.iconSuccess]}>
            <Ionicons name="checkmark-circle" size={44} color="#10b981" />
          </View>
          <Text style={s.title}>Identity Verified!</Text>
          <Text style={s.subtitle}>Moving to accreditation…</Text>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  scrollCenter: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  iconError: { backgroundColor: '#fee2e2' },
  iconSuccess: { backgroundColor: '#dcfce7' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  infoCard: { marginBottom: 20 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoItem: { fontSize: 14, color: colors.textSecondary },
  statusCard: { width: '100%', marginBottom: 20, marginTop: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  subLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  errorTitle: { fontSize: 13, fontWeight: '700', color: '#b91c1c', marginBottom: 6 },
  errorBody: { fontSize: 13, color: '#dc2626', lineHeight: 18 },
  attempts: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 8 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  warningBody: { fontSize: 13, color: '#b45309' },
});
