import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];
  const count = criteria.filter((c) => c.met).length;
  const levels = [
    { label: '', color: '#e2e8f0', bars: 0 },
    { label: 'Weak', color: '#ef4444', bars: 1 },
    { label: 'Weak', color: '#ef4444', bars: 1 },
    { label: 'Fair', color: '#f59e0b', bars: 2 },
    { label: 'Good', color: '#84cc16', bars: 3 },
    { label: 'Strong', color: '#10b981', bars: 4 },
  ];
  return { criteria, level: levels[count] };
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const { criteria, level } = getStrength(password);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i < level.bars ? level.color : '#e2e8f0' },
            ]}
          />
        ))}
      </View>
      {level.label ? (
        <Text style={[styles.strengthLabel, { color: level.color }]}>
          {level.label}
        </Text>
      ) : null}
      <View style={styles.criteria}>
        {criteria.map((item, i) => (
          <Text key={i} style={[styles.criterion, item.met ? styles.met : styles.unmet]}>
            {item.met ? '✓' : '·'} {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: -8, marginBottom: 16 },
  bars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  criteria: { gap: 2 },
  criterion: { fontSize: 11, lineHeight: 16 },
  met: { color: '#10b981', fontWeight: '500' },
  unmet: { color: '#94a3b8' },
});
