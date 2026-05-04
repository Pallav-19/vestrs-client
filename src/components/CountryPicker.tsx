import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme';

export interface Country {
  code: string;
  name: string;
  dialCode?: string;
  flag?: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
];

interface CountryPickerProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  showDialCode?: boolean;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = 'Select country',
  showDialCode = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selected = COUNTRIES.find((c) => c.code === value);
  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
        activeOpacity={0.7}
      >
        {selected ? (
          <Text style={styles.selectedText}>
            {selected.flag} {selected.name}
            {showDialCode && selected.dialCode ? ` (${selected.dialCode})` : ''}
          </Text>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => { setVisible(false); setSearch(''); }}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
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
                onPress={() => { onChange(item.code); setVisible(false); setSearch(''); }}
                style={[styles.row, item.code === value && styles.rowSelected]}
                activeOpacity={0.6}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.rowBody}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>
                    {item.code}{showDialCode && item.dialCode ? ` · ${item.dialCode}` : ''}
                  </Text>
                </View>
                {item.code === value ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : null}
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  triggerError: { borderColor: colors.error },
  selectedText: { flex: 1, fontSize: 16, color: colors.text },
  placeholder: { flex: 1, fontSize: 16, color: colors.placeholder },
  chevron: { fontSize: 14, color: colors.textMuted },
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
  doneBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  doneBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

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
  rowSelected: { backgroundColor: colors.primaryLight },
  flag: { fontSize: 24, marginRight: 14 },
  rowBody: { flex: 1 },
  countryName: { fontSize: 15, fontWeight: '500', color: colors.text },
  countryCode: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  checkmark: { fontSize: 16, color: colors.primary, fontWeight: '700' },
});
