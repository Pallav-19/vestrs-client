import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { accreditationApi, AccredStatusResponse } from '../../api/accreditation';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

function StepIndicator() {
  return (
    <View style={si.row}>
      {[
        { label: 'Identity', done: true },
        { label: 'Accreditation', active: true },
        { label: 'Bank' },
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
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 24 },
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

export const AccreditationScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [initiateError, setInitiateError] = useState('');
  const [retryError, setRetryError] = useState('');

  const step = user?.onboardingStep;
  const isPolling = step === 'ACCRED_INITIATED';

  const { data: accredStatus } = useQuery<AccredStatusResponse>({
    queryKey: ['accred-status'],
    queryFn: accreditationApi.getStatus,
    enabled: isPolling,
    refetchInterval: isPolling ? 30000 : false,
  });

  useEffect(() => {
    if (!isPolling || !accredStatus) return;
    if (accredStatus.status === 'success' || accredStatus.status === 'failure') {
      authApi.getMe().then(setUser);
    }
  }, [accredStatus?.status]);

  const initiateMutation = useMutation({
    mutationFn: accreditationApi.initiate,
    onSuccess: () => authApi.getMe().then(setUser),
    onError: (err) => setInitiateError(getErrorMessage(err)),
  });

  const retryMutation = useMutation({
    mutationFn: accreditationApi.retry,
    onSuccess: () => { setRetryError(''); authApi.getMe().then(setUser); },
    onError: (err) => setRetryError(getErrorMessage(err)),
  });

  if (step === 'KYC_SUCCESS') {
    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator />
          <View style={s.iconWrap}>
            <Ionicons name="ribbon-outline" size={40} color={colors.primary} />
          </View>
          <Text style={s.title}>Accreditation Review</Text>
          <Text style={s.subtitle}>
            As an accredited investor you'll access exclusive investment opportunities.
          </Text>

          <Card variant="warning" style={s.card}>
            <View style={s.warningHeader}>
              <Ionicons name="time-outline" size={14} color="#92400e" style={{ marginRight: 6 }} />
              <Text style={s.warningTitle}>Important timeline</Text>
            </View>
            <Text style={s.warningBody}>
              This review may take 12–48 hours. Our compliance team reviews each application carefully.
            </Text>
          </Card>

          <Card style={s.card}>
            <Text style={s.cardTitle}>What we review</Text>
            {['Financial status & net worth', 'Investment experience', 'Regulatory compliance'].map((item) => (
              <View key={item} style={s.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={s.infoItem}>{item}</Text>
              </View>
            ))}
          </Card>

          {initiateError ? <ErrorMessage message={initiateError} /> : null}

          <Button
            title="Start Accreditation Review"
            onPress={() => { setInitiateError(''); initiateMutation.mutate(); }}
            loading={initiateMutation.isPending}
            size="lg"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'ACCRED_INITIATED') {
    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.scrollCenter} showsVerticalScrollIndicator={false}>
          <StepIndicator />
          <LoadingSpinner size="large" />
          <Text style={s.title}>Under Review</Text>
          <Text style={s.subtitle}>Our compliance team is reviewing your application.</Text>

          <Card variant="warning" style={[s.card, { width: '100%' }]}>
            <View style={s.warningHeader}>
              <Ionicons name="time-outline" size={14} color="#92400e" style={{ marginRight: 6 }} />
              <Text style={s.warningTitle}>This may take 12–48 hours</Text>
            </View>
            <Text style={s.warningBody}>
              You can close the app and come back later — we'll keep checking automatically.
            </Text>
          </Card>

          <Card style={[s.card, { width: '100%' }]}>
            <Text style={s.cardTitle}>Review Status</Text>
            <View style={s.statusRow}>
              <Badge label="pending" variant="warning" />
              <Text style={s.pollNote}>Checking every 30 seconds…</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'ACCRED_FAILED') {
    const attempts = (accredStatus as any)?.attemptCount ?? 0;
    const max = (accredStatus as any)?.maxAttempts ?? 3;

    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <StepIndicator />
          <View style={[s.iconWrap, s.iconError]}>
            <Ionicons name="close-circle-outline" size={40} color={colors.error} />
          </View>
          <Text style={s.title}>Accreditation Failed</Text>

          <Card variant="error" style={s.card}>
            <Text style={s.errorTitle}>Review outcome</Text>
            <Text style={s.errorBody}>
              {(accredStatus as any)?.message || 'Your application was not approved at this time.'}
            </Text>
            {attempts > 0 ? <Text style={s.attempts}>Attempts: {attempts}/{max}</Text> : null}
          </Card>

          <Card variant="warning" style={s.card}>
            <Text style={s.warningTitle}>What you can do</Text>
            <Text style={s.warningBody}>
              You may reapply after updating your financial information. Each review takes 12–48 hours.
            </Text>
          </Card>

          {retryError ? <ErrorMessage message={retryError} /> : null}

          {attempts < max ? (
            <Button
              title={`Reapply (${attempts}/${max} used)`}
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

  if (step === 'ACCRED_SUCCESS') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.successWrap}>
          <View style={[s.iconWrap, s.iconSuccess]}>
            <Ionicons name="checkmark-circle" size={44} color="#10b981" />
          </View>
          <Text style={s.title}>Accreditation Approved!</Text>
          <Text style={s.subtitle}>Moving to bank account setup…</Text>
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
  card: { marginBottom: 16 },

  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoItem: { fontSize: 14, color: colors.textSecondary },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pollNote: { fontSize: 13, color: colors.textSecondary, marginLeft: 10 },

  warningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  warningBody: { fontSize: 13, color: '#b45309', lineHeight: 18 },

  errorTitle: { fontSize: 14, fontWeight: '700', color: '#b91c1c', marginBottom: 6 },
  errorBody: { fontSize: 13, color: '#dc2626', lineHeight: 18 },
  attempts: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 8 },
});
