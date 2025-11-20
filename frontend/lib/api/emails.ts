import { apiClient } from './client';

export enum EmailStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  CLOSED = 'closed',
}

export enum EmailSpamStatus {
  NOT_SPAM = 'not_spam',
  SPAM = 'spam',
  POSSIBLE_SPAM = 'possible_spam',
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  fromAddress: string;
  fromName: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  receivedAt: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  status: EmailStatus;
  spamStatus: EmailSpamStatus;
  spamConfidence?: number;
  projectId?: string | null;
  assignedToId?: string | null;
  assignedToRoleId?: string | null;
  aiSuggestedProjectId?: string | null;
  aiProjectConfidence?: number;
  isUnassigned: boolean;
  provider?: string;
  providerEmailId?: string;
  threadId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  project?: { id: string; name: string };
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  attachments?: Array<{ id: string; filename: string; contentType: string; size: number }>;
  thread?: { id: string; subject: string; emails: Email[] };
}

export interface EmailFilter {
  projectId?: string;
  status?: EmailStatus;
  assignedToId?: string;
  isUnassigned?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ResetEmailsResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

export const emailsApi = {
  getAll: async (filters?: EmailFilter): Promise<Email[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
    if (filters?.isUnassigned !== undefined) params.append('isUnassigned', String(filters.isUnassigned));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiClient.get<Email[]>(`/emails?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string): Promise<Email> => {
    const response = await apiClient.get<Email>(`/emails/${id}`);
    return response.data;
  },

  resetAll: async (password: string): Promise<ResetEmailsResponse> => {
    const response = await apiClient.post<ResetEmailsResponse>('/emails/reset-all', {
      password,
    });
    return response.data;
  },
};
