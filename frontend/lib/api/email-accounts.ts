import { apiClient } from './client';

export type EmailProvider = 'gmail' | 'outlook' | 'imap';

export interface EmailAccount {
  id: string;
  name: string;
  provider: EmailProvider;
  account: string;
  redirectUri?: string;
  isActive: boolean;
  lastIngestedAt?: string;
  lastIngestedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailAccountDto {
  name: string;
  provider: EmailProvider;
  account: string;
  credentials: Record<string, unknown>;
  redirectUri?: string;
  isActive?: boolean;
}

export interface UpdateEmailAccountDto {
  name?: string;
  provider?: EmailProvider;
  account?: string;
  credentials?: any;
  redirectUri?: string;
  isActive?: boolean;
}

export interface IngestResponse {
  success: boolean;
  ingested: number;
  message: string;
}

export const emailAccountsApi = {
  getAll: async (): Promise<EmailAccount[]> => {
    const response = await apiClient.get<EmailAccount[]>('/email-accounts');
    return response.data;
  },

  getOne: async (id: string): Promise<EmailAccount> => {
    const response = await apiClient.get<EmailAccount>(`/email-accounts/${id}`);
    return response.data;
  },

  create: async (data: CreateEmailAccountDto): Promise<EmailAccount> => {
    const response = await apiClient.post<EmailAccount>('/email-accounts', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateEmailAccountDto,
  ): Promise<EmailAccount> => {
    const response = await apiClient.patch<EmailAccount>(
      `/email-accounts/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/email-accounts/${id}`);
  },

  ingest: async (id: string, since?: string): Promise<IngestResponse> => {
    // Build URL with query parameter for POST request
    let url = `/email-accounts/${id}/ingest`;
    if (since) {
      // Encode the date parameter properly
      const encodedSince = encodeURIComponent(since);
      url += `?since=${encodedSince}`;
      console.log(`🔗 API Request URL: ${url}`);
      console.log(`   Original date: ${since}`);
      console.log(`   Encoded date: ${encodedSince}`);
    } else {
      console.log(`🔗 API Request URL: ${url} (NO DATE PARAMETER)`);
    }
    
    // Use longer timeout for email ingestion (10 minutes)
    const response = await apiClient.post<IngestResponse>(
      url,
      {},
      { 
        timeout: 600000, // 10 minutes for email ingestion
      },
    );
    return response.data;
  },
};

