import React from 'react';
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
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';

const STEP_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  REGISTERED:       { label: 'Registered',           color: '#64748b', bg: '#f1f5f9' },
  KYC_INITIATED:    { label: 'KYC In Progress',       color: '#1d4ed8', bg: '#dbeafe' },
  KYC_FAILED:       { label: 'KYC Failed',            color: '#dc2626', bg: '#fee2e2' },
  KYC_SUCCESS:      { label: 'KYC Verified',          color: '#15803d', bg: '#dcfce7' },
  ACCRED_INITIATED: { label: 'Accreditation Pending', color: '#92400e', bg: '#fef3c7' },
  ACCRED_FAILED:    { label: 'Accreditation Failed',  color: '#dc2626', bg: '#fee2e2' },
  ACCRED_SUCCESS:   { label: 'Accredited',            color: '#15803d', bg: '#dcfce7' },
  COMPLETE:         { label: 'Active Investor',       color: '#4f46e5', bg: '#eef2ff' },
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={av.wrap}>
      <Text style={av.text}>{initials}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  wrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  text: { fontSize: 28, fontWeight: '800', color: '#fff' },
});

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={s.detailRow}>
      <View style={s.detailIconWrap}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={s.detailBody}>
        <Text style={s.detailLabel}>{label}</Text>
        <Text style={s.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const step = STEP_LABELS[user.onboardingStep] ?? STEP_LABELS.REGISTERED;
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Avatar name={user.name} />
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.email}>{user.email}</Text>
          <View style={[s.badge, { backgroundColor: step.bg }]}>
            <View style={[s.badgeDot, { backgroundColor: step.color }]} />
            <Text style={[s.badgeText, { color: step.color }]}>{step.label}</Text>
          </View>
        </View>

        {/* Account info */}
        <Card style={s.card}>
          <Text style={s.sectionTitle}>Account Details</Text>
          <DetailRow icon="person-outline" label="Full Name" value={user.name} />
          <DetailRow icon="mail-outline" label="Email" value={user.email} />
          <DetailRow icon="call-outline" label="Phone" value={user.phone || '—'} />
          <DetailRow icon="flag-outline" label="Nationality" value={user.nationality || '—'} />
          <DetailRow icon="location-outline" label="Country of Domicile" value={user.domicile || '—'} />
          <DetailRow icon="calendar-outline" label="Member Since" value={memberSince} />
        </Card>

        {/* Account status */}
        <Card style={s.card}>
          <Text style={s.sectionTitle}>Account Status</Text>
          <View style={s.statusRow}>
            <View style={s.detailIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            </View>
            <View style={s.detailBody}>
              <Text style={s.detailLabel}>Onboarding Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={[s.badgeDot, { backgroundColor: step.color, marginRight: 6 }]} />
                <Text style={[s.detailValue, { color: step.color }]}>{step.label}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Sign out */}
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Vestrs v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 48 },

  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 14, letterSpacing: -0.5 },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 3 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailBody: { flex: 1 },
  detailLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 1 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#dc2626' },

  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted },
});
