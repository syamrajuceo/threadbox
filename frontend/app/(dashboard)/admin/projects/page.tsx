'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  projectsApi,
  Project,
  CreateProjectDto,
} from '@/lib/api/projects';
import {
  TextInput,
  TextArea,
  Button,
  Tile,
  Loading,
  Modal,
  Stack,
  Grid,
  Column,
  Heading,
  Tag,
  FormGroup,
} from '@carbon/react';
import { ArrowLeft, Add, Edit, TrashCan, Close } from '@carbon/icons-react';

export default function ProjectsManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    clientName: '',
    description: '',
    domains: [],
    keywords: [],
    knownAddresses: [],
  });
  const [domainInput, setDomainInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

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
  }, [isAuthenticated, user, router]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsApi.create(formData);
      setShowCreateModal(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await projectsApi.update(editingProject.id, formData);
      setEditingProject(null);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsApi.delete(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientName: '',
      description: '',
      domains: [],
      keywords: [],
      knownAddresses: [],
    });
    setDomainInput('');
    setKeywordInput('');
    setAddressInput('');
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientName: project.clientName,
      description: project.description || '',
      domains: project.domains || [],
      keywords: project.keywords || [],
      knownAddresses: project.knownAddresses || [],
    });
  };

  const addDomain = () => {
    if (domainInput.trim()) {
      setFormData({
        ...formData,
        domains: [...(formData.domains || []), domainInput.trim()],
      });
      setDomainInput('');
    }
  };

  const removeDomain = (index: number) => {
    const newDomains = [...(formData.domains || [])];
    newDomains.splice(index, 1);
    setFormData({ ...formData, domains: newDomains });
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...(formData.keywords || [])];
    newKeywords.splice(index, 1);
    setFormData({ ...formData, keywords: newKeywords });
  };

  const addAddress = () => {
    if (addressInput.trim()) {
      setFormData({
        ...formData,
        knownAddresses: [...(formData.knownAddresses || []), addressInput.trim()],
      });
      setAddressInput('');
    }
  };

  const removeAddress = (index: number) => {
    const newAddresses = [...(formData.knownAddresses || [])];
    newAddresses.splice(index, 1);
    setFormData({ ...formData, knownAddresses: newAddresses });
  };

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
          <Heading>Project Management</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => setShowCreateModal(true)}
        >
          Create Project
        </Button>
      </div>

      {/* Projects List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading projects" withOverlay={false} />
        </div>
      ) : (
        <Grid>
          {projects.map((project) => (
            <Column key={project.id} lg={4} md={4} sm={4}>
              <Tile style={{ height: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Stack gap={4} style={{ height: '100%' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '1.125rem', minHeight: '1.5rem' }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', minHeight: '1.25rem' }}>
                      {project.clientName}
                    </p>
                  </div>
                  <div style={{ flex: 1, minHeight: '3rem' }}>
                    {project.description ? (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--cds-text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          margin: 0,
                        }}
                      >
                        {project.description}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0, minHeight: '3rem' }}>
                        &nbsp;
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Button
                      kind="secondary"
                      size="sm"
                      renderIcon={Edit}
                      onClick={() => openEditModal(project)}
                      style={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      kind="danger"
                      size="sm"
                      renderIcon={TrashCan}
                      onClick={() => handleDelete(project.id)}
                      style={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </div>
                </Stack>
              </Tile>
            </Column>
          ))}
        </Grid>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProject) && (
        <Modal
          open={showCreateModal || !!editingProject}
          modalHeading={editingProject ? 'Edit Project' : 'Create Project'}
          primaryButtonText={editingProject ? 'Update' : 'Create'}
          secondaryButtonText="Cancel"
          onRequestClose={() => {
            setShowCreateModal(false);
            setEditingProject(null);
            resetForm();
          }}
          onRequestSubmit={editingProject ? handleUpdate : handleCreate}
          size="md"
        >
          <form onSubmit={editingProject ? handleUpdate : handleCreate}>
            <Stack gap={6}>
              <FormGroup legendText="">
                <TextInput
                  id="project-name"
                  labelText="Project Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup legendText="">
                <TextInput
                  id="client-name"
                  labelText="Client Name"
                  required
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
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
                <div>
                  <TextInput
                    id="domain-input"
                    labelText="Domains"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDomain();
                      }
                    }}
                    placeholder="example.com"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button
                      kind="secondary"
                      size="sm"
                      onClick={addDomain}
                      type="button"
                    >
                      Add Domain
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {formData.domains?.map((domain, index) => (
                      <Tag
                        key={index}
                        type="blue"
                        size="sm"
                        filter
                        onClose={() => removeDomain(index)}
                      >
                        {domain}
                      </Tag>
                    ))}
                  </div>
                </div>
              </FormGroup>

              <FormGroup legendText="">
                <div>
                  <TextInput
                    id="keyword-input"
                    labelText="Keywords"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="keyword"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button
                      kind="secondary"
                      size="sm"
                      onClick={addKeyword}
                      type="button"
                    >
                      Add Keyword
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {formData.keywords?.map((keyword, index) => (
                      <Tag
                        key={index}
                        type="green"
                        size="sm"
                        filter
                        onClose={() => removeKeyword(index)}
                      >
                        {keyword}
                      </Tag>
                    ))}
                  </div>
                </div>
              </FormGroup>

              <FormGroup legendText="">
                <div>
                  <TextInput
                    id="address-input"
                    labelText="Known Addresses"
                    type="email"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAddress();
                      }
                    }}
                    placeholder="email@example.com"
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button
                      kind="secondary"
                      size="sm"
                      onClick={addAddress}
                      type="button"
                    >
                      Add Address
                    </Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {formData.knownAddresses?.map((address, index) => (
                      <Tag
                        key={index}
                        type="purple"
                        size="sm"
                        filter
                        onClose={() => removeAddress(index)}
                      >
                        {address}
                      </Tag>
                    ))}
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
