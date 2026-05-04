import { apiClient } from './client';

export interface BankAccount {
  id: string;
  bankName: string;
  maskedNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  linkedAt: string;
}

export interface LinkBankPayload {
  publicToken: string;
  accountId: string;
}

export const bankApi = {
  link: async (payload: LinkBankPayload): Promise<BankAccount> => {
    const response = await apiClient.post('/bank/link', payload);
    return response.data.data;
  },

  list: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get('/bank/accounts');
    return response.data.data;
  },

  unlink: async (accountId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/bank/accounts/${accountId}`);
    return response.data.data;
  },
};
