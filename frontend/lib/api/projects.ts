import { apiClient } from './client';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description?: string;
  domains?: string[];
  keywords?: string[];
  knownAddresses?: string[];
  role?: string;
  openEmailsCount?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  clientName: string;
  description?: string;
  domains?: string[];
  keywords?: string[];
  knownAddresses?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  clientName?: string;
  description?: string;
  domains?: string[];
  keywords?: string[];
  knownAddresses?: string[];
}

export const projectsApi = {
  getDashboard: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/dashboard');
    return response.data;
  },
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },
  getProject: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

