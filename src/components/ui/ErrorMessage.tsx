import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface ErrorMessageProps {
  message: string;
  title?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
}) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠</Text>
      <View style={styles.body}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  icon: {
    fontSize: 15,
    color: colors.error,
    marginRight: 8,
    marginTop: 1,
  },
  body: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 18,
  },
});
