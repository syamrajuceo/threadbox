import { useState, useEffect } from 'react';
import { projectsApi, Project } from '../api/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.getDashboard();
        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: () => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.getDashboard();
        setProjects(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  } };
}

