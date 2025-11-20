'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { rolesApi, Role, CreateRoleDto } from '@/lib/api/roles';
import { projectsApi } from '@/lib/api/projects';
import {
  TextInput,
  TextArea,
  Button,
  Select,
  SelectItem,
  Checkbox,
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
import { ArrowLeft, Add, Edit, TrashCan } from '@carbon/icons-react';

const PERMISSION_TYPES = [
  'view_scope',
  'assignment',
  'member_management',
  'email_sending',
  'status_change',
];

export default function RolesManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    type: 'custom',
    projectId: '',
    permissions: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.globalRole !== 'super_user') {
      router.push('/dashboard');
      return;
    }
    loadProjects();
  }, [isAuthenticated, user, router, loadProjects]);

  useEffect(() => {
    if (selectedProject) {
      loadRoles(selectedProject);
    } else {
      loadRoles();
    }
  }, [selectedProject]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, [selectedProject]);

  const loadRoles = async (projectId?: string) => {
    try {
      setLoading(true);
      const data = await rolesApi.getAll(projectId);
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rolesApi.create(formData);
      setShowCreateModal(false);
      resetForm();
      loadRoles(selectedProject);
    } catch (error) {
      console.error('Failed to create role:', error);
      alert('Failed to create role. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await rolesApi.update(editingRole.id, formData);
      setEditingRole(null);
      resetForm();
      loadRoles(selectedProject);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await rolesApi.delete(id);
      loadRoles(selectedProject);
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'custom',
      projectId: selectedProject || '',
      permissions: [],
    });
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      type: role.type,
      projectId: role.projectId,
      permissions: role.permissions?.map((p) => p.type) || [],
    });
  };

  const togglePermission = (permission: string) => {
    const current = formData.permissions || [];
    if (current.includes(permission)) {
      setFormData({
        ...formData,
        permissions: current.filter((p) => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...current, permission],
      });
    }
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type' },
    { key: 'project', header: 'Project' },
    { key: 'permissions', header: 'Permissions' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = roles.map((role) => ({
    id: role.id,
    name: role.name,
    type: role.type.replace('_', ' '),
    project: projects.find((p) => p.id === role.projectId)?.name || role.projectId,
    permissions: role.permissions?.length || 0,
    actions: role.id,
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
          <Heading>Role Management</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => {
            setFormData({ ...formData, projectId: selectedProject || '' });
            setShowCreateModal(true);
          }}
        >
          Create Role
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

      {/* Roles Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading roles" withOverlay={false} />
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
                    const role = roles.find((r) => r.id === row.id);
                    if (!role) return null;
                    
                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell key={`${row.id}-name`}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{role.name}</div>
                            {role.description && (
                              <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                {role.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell key={`${row.id}-type`}>
                          <Tag type="purple" size="sm">
                            {role.type.replace('_', ' ')}
                          </Tag>
                        </TableCell>
                        <TableCell key={`${row.id}-project`}>
                          {projects.find((p) => p.id === role.projectId)?.name || role.projectId}
                        </TableCell>
                        <TableCell key={`${row.id}-permissions`}>
                          {role.permissions?.length || 0} permissions
                        </TableCell>
                        <TableCell key={`${row.id}-actions`}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Edit}
                              onClick={() => openEditModal(role)}
                            >
                              Edit
                            </Button>
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              onClick={() => handleDelete(role.id)}
                            >
                              Delete
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <Modal
          open={showCreateModal || !!editingRole}
          modalHeading={editingRole ? 'Edit Role' : 'Create Role'}
          primaryButtonText={editingRole ? 'Update' : 'Create'}
          secondaryButtonText="Cancel"
          onRequestClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
            resetForm();
          }}
          onRequestSubmit={editingRole ? handleUpdate : handleCreate}
          size="md"
        >
          <form onSubmit={editingRole ? handleUpdate : handleCreate}>
            <Stack gap={6}>
              <FormGroup legendText="">
                <Select
                  id="project"
                  labelText="Project"
                  required
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  disabled={!!editingRole}
                >
                  <SelectItem value="" text="Select a project" />
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} text={project.name} />
                  ))}
                </Select>
              </FormGroup>

              <FormGroup legendText="">
                <TextInput
                  id="name"
                  labelText="Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <TextArea
                  id="description"
                  labelText="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </FormGroup>

              <FormGroup legendText="">
                <Select
                  id="type"
                  labelText="Type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                >
                  <SelectItem value="project_manager" text="Project Manager" />
                  <SelectItem value="developer" text="Developer" />
                  <SelectItem value="tester" text="Tester" />
                  <SelectItem value="custom" text="Custom" />
                </Select>
              </FormGroup>

              <FormGroup legendText="">
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Permissions</p>
                  <div
                    style={{
                      border: '1px solid var(--cds-border-subtle-01)',
                      borderRadius: '4px',
                      padding: '1rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    <Stack gap={3}>
                      {PERMISSION_TYPES.map((permission) => (
                        <Checkbox
                          key={permission}
                          id={`permission-${permission}`}
                          labelText={permission.replace(/_/g, ' ')}
                          checked={formData.permissions?.includes(permission) || false}
                          onChange={() => togglePermission(permission)}
                        />
                      ))}
                    </Stack>
                  </div>
                </div>
              </FormGroup>
            </Stack>
          </form>
        </Modal>
      )}
    </Stack>
  );
}
