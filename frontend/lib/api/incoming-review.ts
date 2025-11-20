import { apiClient } from './client';

export interface UnassignedEmail {
  id: string;
  subject: string;
  fromAddress: string;
  fromName: string;
  receivedAt: string;
  spamStatus: 'not_spam' | 'spam' | 'possible_spam';
  spamConfidence?: number;
  aiSuggestedProjectId?: string;
  aiProjectConfidence?: number;
  projectId?: string | null;
  isUnassigned?: boolean;
  project?: {
    id: string;
    name: string;
  };
}

export const incomingReviewApi = {
  getUnassignedEmails: async (filters?: {
    spamStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<UnassignedEmail[]> => {
    const params = new URLSearchParams();
    if (filters?.spamStatus) params.append('spamStatus', filters.spamStatus);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<UnassignedEmail[]>(
      `/incoming-review?${params.toString()}`,
    );
    return response.data;
  },
  assignToProject: async (emailId: string, projectId: string) => {
    // Send null explicitly for unassignment, or the projectId string
    const body = projectId === '' || !projectId 
      ? { projectId: null } 
      : { projectId };
    return apiClient.patch(`/incoming-review/${emailId}/assign-project`, body);
  },
  assignToUser: async (emailId: string, userId: string) => {
    return apiClient.patch(`/incoming-review/${emailId}/assign-user`, {
      userId,
    });
  },
  markSpamStatus: async (
    emailId: string,
    spamStatus: 'not_spam' | 'spam' | 'possible_spam',
  ) => {
    return apiClient.patch(`/incoming-review/${emailId}/spam-status`, {
      spamStatus,
    });
  },
  bulkAssignToProject: async (emailIds: string[], projectId: string) => {
    return apiClient.patch('/incoming-review/bulk/assign-project', {
      emailIds,
      projectId,
    });
  },
  processEmailWithAI: async (emailId: string) => {
    return apiClient.patch(`/incoming-review/${emailId}/process-ai`);
  },
  processEmailsWithAI: async (emailIds: string[]) => {
    return apiClient.patch('/incoming-review/bulk/process-ai', {
      emailIds,
    });
  },
  processAllUnprocessedEmails: async () => {
    return apiClient.post('/incoming-review/process-all-unprocessed');
  },
};

