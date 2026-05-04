import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type OnboardingStep =
  | 'REGISTERED'
  | 'KYC_INITIATED'
  | 'KYC_FAILED'
  | 'KYC_SUCCESS'
  | 'ACCRED_INITIATED'
  | 'ACCRED_FAILED'
  | 'ACCRED_SUCCESS'
  | 'COMPLETE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  domicile: string;
  onboardingStep: OnboardingStep;
  createdAt: string;
}

const SECURE_KEYS = {
  ACCESS_TOKEN: 'vestrs_access_token',
  REFRESH_TOKEN: 'vestrs_refresh_token',
} as const;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setTokens: (access: string, refresh: string) => {
    set({ accessToken: access, refreshToken: refresh });
    SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, access).catch(
      console.error
    );
    SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refresh).catch(
      console.error
    );
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN).catch(console.error);
    SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN).catch(console.error);
  },

  loadFromStorage: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);
      set({ accessToken, refreshToken, isLoading: false });
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      set({ isLoading: false });
    }
  },
}));
