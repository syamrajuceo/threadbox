import { apiClient } from './client';

export interface Membership {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  project?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateMembershipDto {
  userId: string;
  projectId: string;
  roleId: string;
}

export const membershipsApi = {
  getAll: async (projectId?: string, userId?: string): Promise<Membership[]> => {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (userId) params.userId = userId;
    const response = await apiClient.get('/memberships', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Membership> => {
    const response = await apiClient.get(`/memberships/${id}`);
    return response.data;
  },

  create: async (data: CreateMembershipDto): Promise<Membership> => {
    const response = await apiClient.post('/memberships', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/memberships/${id}`);
  },
};

