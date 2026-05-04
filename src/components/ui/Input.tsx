import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, input as inputTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftElement,
  rightElement,
  isPassword = false,
  secureTextEntry,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const actualSecure = isPassword ? !showPassword : secureTextEntry;

  const containerBorderColor = error
    ? colors.borderError
    : focused
    ? colors.borderFocus
    : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, { borderColor: containerBorderColor }]}>
        {leftElement ? <View style={styles.leftEl}>{leftElement}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={actualSecure}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : rightElement ? (
          <View style={styles.rightEl}>{rightElement}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: inputTheme.label,
  container: {
    ...inputTheme.container,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
  },
  error: inputTheme.error,
  leftEl: { marginRight: 8 },
  rightEl: { marginLeft: 8 },
  toggleBtn: { paddingLeft: 10, paddingVertical: 4 },
  toggleText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
});
