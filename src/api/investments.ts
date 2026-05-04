import { apiClient } from './client';

export type InvestmentStatus = 'pending' | 'completed' | 'failed';

export interface Investment {
  id: string;
  amount: number;
  currency: string;
  destinationAccount: string;
  status: InvestmentStatus;
  txRef: string;
  bankAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentPayload {
  bankAccountId: string;
  amount: number;
  destinationAccount: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const investmentsApi = {
  create: async (payload: CreateInvestmentPayload): Promise<Investment> => {
    const response = await apiClient.post('/investments', payload);
    return response.data.data;
  },

  list: async (page = 1, limit = 10): Promise<PaginatedResponse<Investment>> => {
    const response = await apiClient.get('/investments', {
      params: { page, limit },
    });
    return response.data.data;
  },

  get: async (id: string): Promise<Investment> => {
    const response = await apiClient.get(`/investments/${id}`);
    return response.data.data;
  },
};
