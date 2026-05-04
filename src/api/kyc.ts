import { apiClient } from './client';

export type KycStatusType = 'pending' | 'success' | 'failure';

export interface KycSubResult {
  status: 'passed' | 'failed' | 'pending';
  message?: string;
}

export interface KycStatusResponse {
  status: KycStatusType;
  message?: string;
  attemptCount?: number;
  maxAttempts?: number;
  subResults?: {
    ckyc?: KycSubResult;
    identity?: KycSubResult;
    aml?: KycSubResult;
  };
}

export const kycApi = {
  initiate: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/kyc/initiate');
    return response.data.data;
  },

  getStatus: async (): Promise<KycStatusResponse> => {
    const response = await apiClient.get('/kyc/status');
    return response.data.data;
  },

  retry: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/kyc/retry');
    return response.data.data;
  },
};
