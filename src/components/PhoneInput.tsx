import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { COUNTRIES } from './CountryPicker';
import { colors } from '../theme';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  const [dialCode, setDialCode] = useState('+1');
  const [localNumber, setLocalNumber] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.dialCode === dialCode) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.dialCode && c.dialCode.includes(search))
  );

  const handleNumberChange = (num: string) => {
    setLocalNumber(num);
    onChange(`${dialCode}${num.replace(/\D/g, '')}`);
  };

  const handleDialCodeChange = (code: string) => {
    setDialCode(code);
    onChange(`${code}${localNumber.replace(/\D/g, '')}`);
    setShowPicker(false);
    setSearch('');
  };

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, { borderColor }]}>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.dialBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{selectedCountry?.flag}</Text>
          <Text style={styles.dialCode}>{dialCode}</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
          value={localNumber}
          onChangeText={handleNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Country Code</Text>
            <TouchableOpacity
              onPress={() => { setShowPicker(false); setSearch(''); }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.placeholder}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleDialCodeChange(item.dialCode!)}
                style={styles.row}
                activeOpacity={0.6}
              >
                <Text style={styles.rowFlag}>{item.flag}</Text>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowCode}>{item.dialCode}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  flag: { fontSize: 18 },
  dialCode: { fontSize: 15, fontWeight: '500', color: colors.text },
  chevron: { fontSize: 11, color: colors.textMuted },
  divider: { width: 1, height: 24, backgroundColor: colors.border },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  error: { fontSize: 12, color: colors.error, marginTop: 4 },

  modal: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  cancelBtn: { padding: 4 },
  cancelText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  searchBox: { padding: 12 },
  searchInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  rowFlag: { fontSize: 22, marginRight: 14 },
  rowName: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  rowCode: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
});
