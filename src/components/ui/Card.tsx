import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { card as cardTheme } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'success' | 'error' | 'warning' | 'info';
  padding?: number;
}

const variantStyles = {
  default: {},
  elevated: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        padding !== undefined ? { padding } : null,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: cardTheme as any,
});
