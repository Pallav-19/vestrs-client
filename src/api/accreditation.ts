import { apiClient } from './client';

export type AccredStatusType = 'pending' | 'success' | 'failure';

export interface AccredStatusResponse {
  status: AccredStatusType;
  message?: string;
  attemptCount?: number;
  maxAttempts?: number;
  reviewedAt?: string;
}

export const accreditationApi = {
  initiate: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/accreditation/initiate');
    return response.data.data;
  },

  getStatus: async (): Promise<AccredStatusResponse> => {
    const response = await apiClient.get('/accreditation/status');
    return response.data.data;
  },

  retry: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/accreditation/retry');
    return response.data.data;
  },
};
