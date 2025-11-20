'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { usersApi, User, CreateUserDto } from '@/lib/api/users';
import {
  TextInput,
  PasswordInput,
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
import { ArrowLeft, Add, Edit, TrashCan } from '@carbon/icons-react';

export default function UsersManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    status: 'active',
    globalRole: 'user',
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
    loadUsers();
  }, [isAuthenticated, user, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create(formData);
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;
      await usersApi.update(editingUser.id, updateData);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      status: 'active',
      globalRole: 'user',
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      globalRole: user.globalRole,
    });
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'role', header: 'Role' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    status: u.status,
    role: u.globalRole === 'super_user' ? 'Super User' : 'User',
    actions: u.id,
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
          <Heading>User Management</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => setShowCreateModal(true)}
        >
          Create User
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading users" withOverlay={false} />
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
                    const user = users.find((u) => u.id === row.id);
                    if (!user) return null;
                    
                    return (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell key={`${row.id}-name`}>{row.cells.find((c) => c.info.header === 'name')?.value}</TableCell>
                        <TableCell key={`${row.id}-email`}>{row.cells.find((c) => c.info.header === 'email')?.value}</TableCell>
                        <TableCell key={`${row.id}-status`}>
                          <Tag type={user.status === 'active' ? 'green' : 'red'} size="sm">
                            {user.status}
                          </Tag>
                        </TableCell>
                        <TableCell key={`${row.id}-role`}>
                          <Tag type="blue" size="sm">
                            {row.cells.find((c) => c.info.header === 'role')?.value}
                          </Tag>
                        </TableCell>
                        <TableCell key={`${row.id}-actions`}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Edit}
                              onClick={() => openEditModal(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              onClick={() => handleDelete(user.id)}
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
      {(showCreateModal || editingUser) && (
        <Modal
          open={showCreateModal || !!editingUser}
          modalHeading={editingUser ? 'Edit User' : 'Create User'}
          primaryButtonText={editingUser ? 'Update' : 'Create'}
          secondaryButtonText="Cancel"
          onRequestClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
            resetForm();
          }}
          onRequestSubmit={editingUser ? handleUpdate : handleCreate}
          size="md"
        >
          <form onSubmit={editingUser ? handleUpdate : handleCreate}>
            <Stack gap={6}>
              <FormGroup legendText="">
                <TextInput
                  id="email"
                  labelText="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <PasswordInput
                  id="password"
                  labelText={`Password ${editingUser ? '(leave blank to keep current)' : ''}`}
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <TextInput
                  id="first-name"
                  labelText="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <TextInput
                  id="last-name"
                  labelText="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <Select
                  id="status"
                  labelText="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                >
                  <SelectItem value="active" text="Active" />
                  <SelectItem value="inactive" text="Inactive" />
                </Select>
              </FormGroup>

              <FormGroup legendText="">
                <Select
                  id="global-role"
                  labelText="Global Role"
                  value={formData.globalRole}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalRole: e.target.value as 'super_user' | 'user',
                    })
                  }
                >
                  <SelectItem value="user" text="User" />
                  <SelectItem value="super_user" text="Super User" />
                </Select>
              </FormGroup>
            </Stack>
          </form>
        </Modal>
      )}
    </Stack>
  );
}
