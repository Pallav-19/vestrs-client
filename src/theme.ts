import { Platform } from 'react-native';

export const colors = {
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  primaryLight: '#eef2ff',
  primaryMuted: '#a5b4fc',
  surface: '#ffffff',
  background: '#f8fafc',
  border: '#e2e8f0',
  borderFocus: '#4f46e5',
  borderError: '#ef4444',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  placeholder: '#94a3b8',
  success: '#10b981',
  successLight: '#ecfdf5',
  successBorder: '#6ee7b7',
  error: '#ef4444',
  errorLight: '#fef2f2',
  errorBorder: '#fca5a5',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  warningBorder: '#fcd34d',
  info: '#3b82f6',
  infoLight: '#eff6ff',
  infoBorder: '#93c5fd',
  overlay: 'rgba(0,0,0,0.4)',
};

export const card = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: '#f1f5f9',
  ...Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
  }),
};

export const input = {
  container: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#334155',
    marginBottom: 6,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
};
