import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isDisabled && styles[`disabled_${variant}`],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
    styles[`textVariant_${variant}`],
    isDisabled && styles.textDisabled,
  ];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={containerStyle}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text style={textStyle}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  size_sm: { paddingHorizontal: 14, paddingVertical: 9 },
  size_md: { paddingHorizontal: 20, paddingVertical: 13 },
  size_lg: { paddingHorizontal: 24, paddingVertical: 16 },

  variant_primary: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  variant_secondary: {
    backgroundColor: '#f1f5f9',
  },
  variant_danger: {
    backgroundColor: colors.error,
    ...Platform.select({
      ios: {
        shadowColor: colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  variant_outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  disabled_primary: { backgroundColor: '#a5b4fc', shadowOpacity: 0 },
  disabled_secondary: { backgroundColor: '#e2e8f0' },
  disabled_danger: { backgroundColor: '#fca5a5', shadowOpacity: 0 },
  disabled_outline: { borderColor: '#a5b4fc' },
  disabled_ghost: { opacity: 0.5 },

  text: { fontWeight: '600' },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 16 },

  textVariant_primary: { color: '#ffffff' },
  textVariant_secondary: { color: '#334155' },
  textVariant_danger: { color: '#ffffff' },
  textVariant_outline: { color: colors.primary },
  textVariant_ghost: { color: colors.primary },
  textDisabled: { opacity: 0.7 },
} as any);
