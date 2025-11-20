import { apiClient } from './client';

export interface AIConnectionTestResult {
  success: boolean;
  connected: boolean;
  message: string;
  details?: {
    status: string;
    responseTime: number;
  };
  error?: string;
}

export const aiApi = {
  testConnection: async (): Promise<AIConnectionTestResult> => {
    try {
      const response = await apiClient.get<AIConnectionTestResult>('/ai/test-connection');
      return response.data;
    } catch (error: any) {
      // Handle network errors
      return {
        success: false,
        connected: false,
        message: error.response?.data?.message || error.message || 'Failed to test AI connection',
        error: error.response?.data?.error,
      };
    }
  },
};

