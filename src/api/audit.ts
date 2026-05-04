import { apiClient } from './client';
import { PaginatedResponse } from './investments';

export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditEntry {
  id: string;
  action: string;
  status: AuditStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const auditApi = {
  list: async (page = 1, limit = 10): Promise<PaginatedResponse<AuditEntry>> => {
    const response = await apiClient.get('/audit/logs', {
      params: { page, limit },
    });
    return response.data.data;
  },
};
