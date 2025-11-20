import { apiClient } from './client';
import { Email } from './emails';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmailAssignment {
  id: string;
  emailId: string;
  assignedToId: string;
  assignedById: string;
  assignedAt: string;
  assignedTo: User;
  assignedBy: User;
}

export const projectManagerApi = {
  getManagedProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/project-manager/projects');
    return response.data;
  },

  getProjectEmails: async (projectId?: string): Promise<Email[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<Email[]>('/project-manager/emails', {
      params,
    });
    return response.data;
  },

  getProjectUsers: async (projectId: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(
      `/project-manager/projects/${projectId}/users`,
    );
    return response.data;
  },

  getEmailAssignments: async (emailId: string): Promise<EmailAssignment[]> => {
    const response = await apiClient.get<EmailAssignment[]>(
      `/project-manager/emails/${emailId}/assignments`,
    );
    return response.data;
  },

  getUnassignedEmails: async (projectId: string): Promise<Email[]> => {
    const response = await apiClient.get<Email[]>(
      `/project-manager/projects/${projectId}/emails/unassigned`,
    );
    return response.data;
  },

  getAssignedEmails: async (projectId: string): Promise<Email[]> => {
    const response = await apiClient.get<Email[]>(
      `/project-manager/projects/${projectId}/emails/assigned`,
    );
    return response.data;
  },

  assignEmailToMultiple: async (
    emailId: string,
    userIds: string[],
  ): Promise<any> => {
    const response = await apiClient.post(
      `/assignments/email/${emailId}/assign-multiple`,
      { userIds },
    );
    return response.data;
  },

  isProjectManager: async (projectId: string): Promise<boolean> => {
    const response = await apiClient.get<{ isProjectManager: boolean }>(
      `/project-manager/projects/${projectId}/is-manager`,
    );
    return response.data.isProjectManager;
  },
};

