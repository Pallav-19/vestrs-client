import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { CountryPicker } from '../../components/CountryPicker';
import { PhoneInput } from '../../components/PhoneInput';
import { PasswordStrength } from '../../components/PasswordStrength';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';
import { colors } from '../../theme';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[a-z]/, 'Add a lowercase letter')
    .regex(/[0-9]/, 'Add a number')
    .regex(/[^a-zA-Z0-9]/, 'Add a special character'),
  phone: z
    .string()
    .min(7, 'Phone too short')
    .regex(/^\+\d{7,15}$/, 'Use E.164 format e.g. +14155552671'),
  nationality: z.string().min(2, 'Select your nationality'),
  domicile: z.string().min(2, 'Select your country of domicile'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type AuthStack = { Login: undefined; Register: undefined };

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStack>>();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', phone: '', nationality: '', domicile: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await authApi.register(data);
      setTokens(result.tokens.access_token, result.tokens.refresh_token);
      setUser(result.user);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.header}>
        <View style={styles.logoRing}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <Text style={styles.brand}>Vestrs</Text>
        <Text style={styles.tagline}>Create your investor account</Text>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.sub}>Fill in your details to get started</Text>

          {errorMsg ? <ErrorMessage message={errorMsg} /> : null}

          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Full Name" placeholder="John Doe" autoComplete="name"
              value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )} />

          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoComplete="email"
              value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )} />

          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Input label="Password" placeholder="Create a strong password" isPassword
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
              <PasswordStrength password={value} />
            </>
          )} />

          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <PhoneInput label="Phone Number" value={value} onChange={onChange} error={errors.phone?.message} />
          )} />

          <Controller control={control} name="nationality" render={({ field: { onChange, value } }) => (
            <CountryPicker label="Nationality" value={value} onChange={onChange}
              placeholder="Select your nationality" error={errors.nationality?.message} />
          )} />

          <Controller control={control} name="domicile" render={({ field: { onChange, value } }) => (
            <CountryPicker label="Country of Domicile" value={value} onChange={onChange}
              placeholder="Select country of residence" error={errors.domicile?.message} />
          )} />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
            style={styles.cta}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 32 },
  logoRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  brand: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.primaryMuted, marginTop: 3 },
  sheet: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  scroll: { padding: 28, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  cta: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: colors.textSecondary },
  footerLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
