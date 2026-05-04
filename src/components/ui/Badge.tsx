import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  error:   { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
  warning: { bg: '#fef9c3', text: '#a16207', dot: '#eab308' },
  info:    { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  purple:  { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  default: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const v = variants[variant];
  return (
    <View style={[styles.container, { backgroundColor: v.bg }]}>
      <View style={[styles.dot, { backgroundColor: v.dot }]} />
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
