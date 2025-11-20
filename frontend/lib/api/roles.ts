import { apiClient } from './client';

export interface Permission {
  id: string;
  type: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  type: 'project_manager' | 'developer' | 'tester' | 'custom';
  projectId: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  type: 'project_manager' | 'developer' | 'tester' | 'custom';
  projectId: string;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  type?: 'project_manager' | 'developer' | 'tester' | 'custom';
  permissions?: string[];
}

export const rolesApi = {
  getAll: async (projectId?: string): Promise<Role[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get('/roles', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await apiClient.patch(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

