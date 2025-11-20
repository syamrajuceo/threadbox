import { apiClient } from './client';

export type EmailProvider = 'gmail' | 'outlook' | 'imap';

export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export interface OutlookCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
}

export interface ImapCredentials {
  username: string;
  password: string;
  host: string;
  port?: string;
  tls?: boolean;
}

export interface IngestEmailsRequest {
  provider: EmailProvider;
  account: string;
  credentials: GmailCredentials | OutlookCredentials | ImapCredentials;
  since?: string;
}

export interface IngestEmailsResponse {
  success: boolean;
  ingested: number;
  message: string;
}

export interface IngestionStatus {
  status: string;
  message: string;
}

export const emailIngestionApi = {
  ingest: async (data: IngestEmailsRequest): Promise<IngestEmailsResponse> => {
    const response = await apiClient.post<IngestEmailsResponse>(
      '/email-ingestion/ingest',
      data,
    );
    return response.data;
  },

  getStatus: async (): Promise<IngestionStatus> => {
    const response = await apiClient.get<IngestionStatus>(
      '/email-ingestion/status',
    );
    return response.data;
  },
};

