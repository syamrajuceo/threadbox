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
    } catch (error: unknown) {
      // Handle network errors
      const errorWithResponse = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return {
        success: false,
        connected: false,
        message: errorWithResponse.response?.data?.message || errorWithResponse.message || 'Failed to test AI connection',
        error: errorWithResponse.response?.data?.error,
      };
    }
  },
};

