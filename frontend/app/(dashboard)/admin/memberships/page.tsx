'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { membershipsApi, Membership, CreateMembershipDto } from '@/lib/api/memberships';
import { usersApi, User } from '@/lib/api/users';
import { projectsApi } from '@/lib/api/projects';
import { rolesApi, Role } from '@/lib/api/roles';
import {
  Button,
  Select,
  SelectItem,
  Loading,
  Modal,
  Stack,
  Heading,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  FormGroup,
} from '@carbon/react';
import { ArrowLeft, Add, TrashCan } from '@carbon/icons-react';

export default function MembershipsManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateMembershipDto>({
    userId: '',
    projectId: '',
    roleId: '',
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.globalRole !== 'super_user') {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, user, router, loadData]);

  useEffect(() => {
    if (selectedProject) {
      loadMemberships(selectedProject);
      loadRoles(selectedProject);
    } else {
      loadMemberships();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (formData.projectId) {
      loadRoles(formData.projectId);
    }
  }, [formData.projectId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, projectsData] = await Promise.all([
        usersApi.getAll(),
        projectsApi.getAll(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadMemberships = async (projectId?: string) => {
    try {
      const data = await membershipsApi.getAll(projectId);
      setMemberships(data);
    } catch (error) {
      console.error('Failed to load memberships:', error);
    }
  };

  const loadRoles = async (projectId: string) => {
    try {
      const data = await rolesApi.getAll(projectId);
      setAvailableRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await membershipsApi.create(formData);
      setShowCreateModal(false);
      resetForm();
      loadMemberships(selectedProject);
    } catch (error) {
      console.error('Failed to create membership:', error);
      alert('Failed to assign user. User might already be assigned to this project.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this membership?')) return;
    try {
      await membershipsApi.delete(id);
      loadMemberships(selectedProject);
    } catch (error) {
      console.error('Failed to delete membership:', error);
      alert('Failed to remove membership. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      projectId: selectedProject || '',
      roleId: '',
    });
  };

  const headers = [
    { key: 'user', header: 'User' },
    { key: 'project', header: 'Project' },
    { key: 'role', header: 'Role' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = memberships.map((membership) => ({
    id: membership.id,
    user: membership.user
      ? `${membership.user.firstName} ${membership.user.lastName}`
      : 'Unknown User',
    project: membership.project?.name ||
      projects.find((p) => p.id === membership.projectId)?.name ||
      membership.projectId,
    role: membership.role?.name ||
      availableRoles.find((r) => r.id === membership.roleId)?.name ||
      membership.roleId,
    actions: membership.id,
  }));

  return (
    <Stack gap={6}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              color: 'var(--cds-link-primary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
          <Heading>Membership Management</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => {
            setFormData({ ...formData, projectId: selectedProject || '' });
            setShowCreateModal(true);
          }}
        >
          Assign User
        </Button>
      </div>

      {/* Project Filter */}
      <FormGroup legendText="">
        <Select
          id="project-filter"
          labelText="Filter by Project"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{ maxWidth: '300px' }}
        >
          <SelectItem value="" text="All Projects" />
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id} text={project.name} />
          ))}
        </Select>
      </FormGroup>

      {/* Memberships Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading memberships" withOverlay={false} />
        </div>
      ) : (
        <TableContainer>
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const membership = memberships.find((m) => m.id === row.id);
                    if (!membership) return null;
                    
                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell key={`${row.id}-user`}>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {membership.user
                                ? `${membership.user.firstName} ${membership.user.lastName}`
                                : 'Unknown User'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                              {membership.user?.email || membership.userId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell key={`${row.id}-project`}>
                          {membership.project?.name ||
                            projects.find((p) => p.id === membership.projectId)?.name ||
                            membership.projectId}
                        </TableCell>
                        <TableCell key={`${row.id}-role`}>
                          <Tag type="purple" size="sm">
                            {membership.role?.name ||
                              availableRoles.find((r) => r.id === membership.roleId)?.name ||
                              membership.roleId}
                          </Tag>
                        </TableCell>
                        <TableCell key={`${row.id}-actions`}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              onClick={() => handleDelete(membership.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </TableContainer>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          open={showCreateModal}
          modalHeading="Assign User to Project"
          primaryButtonText="Assign"
          secondaryButtonText="Cancel"
          onRequestClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onRequestSubmit={handleCreate}
          size="md"
        >
          <form onSubmit={handleCreate}>
            <Stack gap={6}>
              <FormGroup legendText="">
                <Select
                  id="project"
                  labelText="Project"
                  required
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      projectId: e.target.value,
                      roleId: '',
                    });
                  }}
                >
                  <SelectItem value="" text="Select a project" />
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} text={project.name} />
                  ))}
                </Select>
              </FormGroup>

              <FormGroup legendText="">
                <Select
                  id="user"
                  labelText="User"
                  required
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                >
                  <SelectItem value="" text="Select a user" />
                  {users.map((u) => (
                    <SelectItem
                      key={u.id}
                      value={u.id}
                      text={`${u.firstName} ${u.lastName} (${u.email})`}
                    />
                  ))}
                </Select>
              </FormGroup>

              <FormGroup legendText="">
                <Select
                  id="role"
                  labelText="Role"
                  required
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                  disabled={!formData.projectId}
                  helperText={!formData.projectId ? 'Select a project first' : undefined}
                >
                  <SelectItem
                    value=""
                    text={formData.projectId ? 'Select a role' : 'Select a project first'}
                  />
                  {availableRoles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                      text={`${role.name} (${role.type})`}
                    />
                  ))}
                </Select>
              </FormGroup>
            </Stack>
          </form>
        </Modal>
      )}
    </Stack>
  );
}
