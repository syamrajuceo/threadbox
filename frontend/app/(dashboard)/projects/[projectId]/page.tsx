'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { apiClient } from '@/lib/api/client';
import { emailsApi, Email } from '@/lib/api/emails';
import {
  projectManagerApi,
  User,
  EmailAssignment,
} from '@/lib/api/project-manager';
import { rolesApi, Role } from '@/lib/api/roles';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  Tag,
  Loading,
  Modal,
  Select,
  SelectItem,
  Stack,
  Heading,
  Button,
  Close,
  InlineNotification,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';

interface ProjectDetails {
  id: string;
  name: string;
  clientName: string;
  description: string;
  domains: string[];
  keywords: string[];
  knownAddresses: string[];
}

export default function ProjectViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [unassignedEmails, setUnassignedEmails] = useState<Email[]>([]);
  const [assignedEmails, setAssignedEmails] = useState<Email[]>([]);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingPMCheck, setLoadingPMCheck] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [incomingSubTab, setIncomingSubTab] = useState(0);
  const [emailDetail, setEmailDetail] = useState<Email | null>(null);
  const [projectRoles, setProjectRoles] = useState<Role[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assigningEmailId, setAssigningEmailId] = useState<string | null>(null);
  const [emailAssignments, setEmailAssignments] = useState<
    Map<string, EmailAssignment[]>
  >(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setError(null);
        const response = await apiClient.get<ProjectDetails>(
          `/projects/${projectId}`,
        );
        setProject(response.data);
      } catch (error: any) {
        console.error('Failed to load project:', error);
        setError(error.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    const checkIsPM = async () => {
      try {
        setLoadingPMCheck(true);
        const isPM = await projectManagerApi.isProjectManager(projectId);
        setIsProjectManager(isPM);
        if (isPM) {
          await loadProjectRoles(projectId);
        }
      } catch (error) {
        console.error('Failed to check PM status:', error);
        setIsProjectManager(false);
      } finally {
        setLoadingPMCheck(false);
      }
    };

    if (projectId) {
      fetchProject();
      checkIsPM();
    }
  }, [projectId]);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!projectId || loadingPMCheck) return; // Wait for PM check to complete

      try {
        setLoadingEmails(true);
        if (activeTab === 0) {
          // Regular emails timeline - shows emails visible to user
          const projectEmails = await emailsApi.getAll({ projectId });
          setEmails(projectEmails);
        } else if (activeTab === 1 && isProjectManager) {
          // Incoming mails tab for PMs
          const [unassigned, assigned] = await Promise.all([
            projectManagerApi.getUnassignedEmails(projectId),
            projectManagerApi.getAssignedEmails(projectId),
          ]);
          setUnassignedEmails(unassigned);
          setAssignedEmails(assigned);

          // Load assignments for assigned emails
          const assignmentsMap = new Map<string, EmailAssignment[]>();
          for (const email of assigned) {
            try {
              const assignments =
                await projectManagerApi.getEmailAssignments(email.id);
              assignmentsMap.set(email.id, assignments);
            } catch (error) {
              console.error(
                `Failed to load assignments for email ${email.id}:`,
                error,
              );
            }
          }
          setEmailAssignments(assignmentsMap);
          
          // Load project roles for assignment dropdown
          await loadProjectRoles(projectId);
        }
      } catch (error: any) {
        console.error('Failed to load emails:', error);
        setError(error.response?.data?.message || 'Failed to load emails');
      } finally {
        setLoadingEmails(false);
      }
    };

    if (projectId && !loadingPMCheck && (activeTab === 0 || (activeTab === 1 && isProjectManager))) {
      fetchEmails();
    }
  }, [projectId, activeTab, isProjectManager, loadingPMCheck]);

  const loadProjectRoles = async (projectId: string) => {
    try {
      const data = await rolesApi.getAll(projectId);
      // Filter out project_manager role as PMs shouldn't assign to themselves
      const filteredRoles = data.filter(
        (role) => role.type !== 'project_manager',
      );
      setProjectRoles(filteredRoles);
    } catch (error) {
      console.error('Failed to load project roles:', error);
    }
  };

  const handleEmailClick = async (email: Email) => {
    try {
      // Load full email details
      const fullEmail = await emailsApi.getOne(email.id);
      setEmailDetail(fullEmail);
    } catch (error) {
      console.error('Failed to load email details:', error);
      // Fallback to the email we already have
      setEmailDetail(email);
    }
  };

  const handleAssignToRole = async (emailId: string, roleId: string) => {
    if (!roleId || roleId === '') {
      return; // No role selected
    }

    try {
      setAssigning(true);
      setAssigningEmailId(emailId);

      // Get all users with this role in the project
      const response = await apiClient.get<User[]>(
        `/project-manager/projects/${projectId}/roles/${roleId}/users`,
      );

      if (response.data.length === 0) {
        alert('No users found with this role in the project.');
        setAssigning(false);
        setAssigningEmailId(null);
        return;
      }

      // Assign email to all users with this role
      const userIds = response.data.map((u) => u.id);
      await projectManagerApi.assignEmailToMultiple(emailId, userIds);

      // Reload emails - always reload if we're in the incoming mails tab
      if (activeTab === 1 && projectId && isProjectManager) {
        const [unassigned, assigned] = await Promise.all([
          projectManagerApi.getUnassignedEmails(projectId),
          projectManagerApi.getAssignedEmails(projectId),
        ]);
        setUnassignedEmails(unassigned);
        setAssignedEmails(assigned);

        // Reload assignments
        const assignmentsMap = new Map<string, EmailAssignment[]>();
        for (const email of assigned) {
          try {
            const assignments =
              await projectManagerApi.getEmailAssignments(email.id);
            assignmentsMap.set(email.id, assignments);
          } catch (error) {
            console.error(
              `Failed to load assignments for email ${email.id}:`,
              error,
            );
          }
        }
        setEmailAssignments(assignmentsMap);
      }
    } catch (error: any) {
      console.error('Failed to assign email to role:', error);
      alert(
        error.response?.data?.message ||
          'Failed to assign email. Please try again.',
      );
    } finally {
      setAssigning(false);
      setAssigningEmailId(null);
    }
  };

  const getAssignedUsers = (emailId: string): User[] => {
    const assignments = emailAssignments.get(emailId) || [];
    return assignments.map((a) => a.assignedTo);
  };

  const getStatusTagType = (status: string) => {
    switch (status) {
      case 'open':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'closed':
        return 'gray';
      default:
        return 'purple';
    }
  };

  const getSpamTagType = (spamStatus: string) => {
    switch (spamStatus) {
      case 'spam':
        return 'red';
      case 'possible_spam':
        return 'orange';
      default:
        return undefined;
    }
  };

  if (loading || loadingPMCheck) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <Loading description="Loading project" withOverlay={false} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--cds-text-secondary)' }}>Project not found</p>
      </div>
    );
  }

  return (
    <Stack gap={6}>
      {/* Error Notification */}
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Project Header */}
      <div>
        <Link
          href="/dashboard"
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
          Back to Dashboard
        </Link>
        <Heading>{project.name}</Heading>
        <p style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
          Client: {project.clientName}
        </p>
        {project.description && (
          <p style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
            {project.description}
          </p>
        )}
      </div>

      {/* Tabs - Using working button-based approach styled like Carbon */}
      <div style={{ marginTop: '2rem', width: '100%' }}>
        {/* Tab Navigation */}
        <div 
          style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--cds-border-subtle-01)',
            marginBottom: '1rem'
          }}
        >
          <button 
            onClick={() => setActiveTab(0)}
            style={{ 
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 0 ? '2px solid var(--cds-link-primary)' : '2px solid transparent',
              color: activeTab === 0 ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === 0 ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            Emails Timeline
          </button>
          {isProjectManager && (
            <button 
              onClick={() => setActiveTab(1)}
              style={{ 
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 1 ? '2px solid var(--cds-link-primary)' : '2px solid transparent',
                color: activeTab === 1 ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === 1 ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              Incoming Mails
            </button>
          )}
          <button 
            onClick={() => setActiveTab(isProjectManager ? 2 : 1)}
            style={{ 
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === (isProjectManager ? 2 : 1) ? '2px solid var(--cds-link-primary)' : '2px solid transparent',
              color: activeTab === (isProjectManager ? 2 : 1) ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === (isProjectManager ? 2 : 1) ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            Files & Links Timeline
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 0 && (
            <div>
              <Stack gap={4} style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Heading style={{ fontSize: '1.125rem' }}>Emails Timeline</Heading>
                  <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    {emails.length} email{emails.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loadingEmails ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Loading description="Loading emails" withOverlay={false} />
                  </div>
                ) : emails.length === 0 ? (
                  <Tile>
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--cds-text-secondary)' }}>
                      No emails assigned to this project yet.
                    </div>
                  </Tile>
                ) : (
                  <Stack gap={4}>
                    {emails.map((email) => (
                      <Tile
                        key={email.id}
                        onClick={() => handleEmailClick(email)}
                        style={{
                          cursor: 'pointer',
                          borderLeft: '4px solid var(--cds-link-primary)',
                        }}
                      >
                        <Stack gap={3}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                {email.subject || '(No Subject)'}
                              </h3>
                              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                From: {email.fromName} &lt;{email.fromAddress}&gt;
                              </p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                                {new Date(email.receivedAt).toLocaleString()}
                              </p>
                              {email.body && (
                                <p
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {email.body.substring(0, 200)}...
                                </p>
                              )}
                            </div>
                            <Stack gap={2} style={{ marginLeft: '1rem' }}>
                              <Tag type={getStatusTagType(email.status) as any} size="sm">
                                {email.status}
                              </Tag>
                              {email.spamStatus === 'spam' && (
                                <Tag type="red" size="sm">Spam</Tag>
                              )}
                              {email.spamStatus === 'possible_spam' && (
                                <Tag type="orange" size="sm">Possible Spam</Tag>
                              )}
                            </Stack>
                          </div>
                        </Stack>
                      </Tile>
                    ))}
                  </Stack>
                )}
              </Stack>
            </div>
          )}

          {activeTab === 1 && isProjectManager && (
            <div>
              <Stack gap={4} style={{ marginTop: '1rem' }}>
                <Heading style={{ fontSize: '1.125rem' }}>Incoming Mails</Heading>

                {/* Sub-tabs for Unassigned/Assigned - Using button-based tabs */}
                <div>
                  <div 
                    style={{ 
                      display: 'flex', 
                      borderBottom: '1px solid var(--cds-border-subtle-01)',
                      marginBottom: '1rem'
                    }}
                  >
                    <button 
                      onClick={() => setIncomingSubTab(0)}
                      style={{ 
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'transparent',
                        borderBottom: incomingSubTab === 0 ? '2px solid var(--cds-link-primary)' : '2px solid transparent',
                        color: incomingSubTab === 0 ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: incomingSubTab === 0 ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Unassigned ({unassignedEmails.length})
                    </button>
                    <button 
                      onClick={() => setIncomingSubTab(1)}
                      style={{ 
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'transparent',
                        borderBottom: incomingSubTab === 1 ? '2px solid var(--cds-link-primary)' : '2px solid transparent',
                        color: incomingSubTab === 1 ? 'var(--cds-link-primary)' : 'var(--cds-text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: incomingSubTab === 1 ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Assigned ({assignedEmails.length})
                    </button>
                  </div>

                  {/* Tab Content */}
                  {incomingSubTab === 0 && (
                    <Stack gap={3} style={{ marginTop: '1rem' }}>
                      {loadingEmails ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                          <Loading description="Loading emails" withOverlay={false} />
                        </div>
                      ) : unassignedEmails.length === 0 ? (
                        <Tile>
                          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--cds-text-secondary)' }}>
                            No unassigned emails. All emails have been assigned to team members.
                          </div>
                        </Tile>
                      ) : (
                        unassignedEmails.map((email) => (
                          <Tile key={email.id}>
                            <Stack gap={3}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div
                                  style={{ flex: 1, cursor: 'pointer' }}
                                  onClick={() => handleEmailClick(email)}
                                >
                                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                    {email.subject || '(No Subject)'}
                                  </h3>
                                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                    From: {email.fromName} &lt;{email.fromAddress}&gt;
                                  </p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                                    {new Date(email.receivedAt).toLocaleString()}
                                  </p>
                                </div>
                                <div style={{ marginLeft: '1rem' }}>
                                  <Select
                                    id={`assign-${email.id}`}
                                    labelText=""
                                    hideLabel
                                    value=""
                                    onChange={(e) => {
                                      handleAssignToRole(email.id, e.target.value);
                                    }}
                                    disabled={assigning && assigningEmailId === email.id}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <SelectItem
                                      value=""
                                      text={
                                        assigning && assigningEmailId === email.id
                                          ? 'Assigning...'
                                          : 'Assign to Role...'
                                      }
                                    />
                                    {projectRoles.map((role) => (
                                      <SelectItem key={role.id} value={role.id} text={role.name} />
                                    ))}
                                  </Select>
                                </div>
                              </div>
                            </Stack>
                          </Tile>
                        ))
                      )}
                    </Stack>
                  )}

                  {incomingSubTab === 1 && (
                    <Stack gap={3} style={{ marginTop: '1rem' }}>
                      {loadingEmails ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                          <Loading description="Loading emails" withOverlay={false} />
                        </div>
                      ) : assignedEmails.length === 0 ? (
                        <Tile>
                          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--cds-text-secondary)' }}>
                            No assigned emails yet.
                          </div>
                        </Tile>
                      ) : (
                        assignedEmails.map((email) => {
                          const assignedUsers = getAssignedUsers(email.id);
                          return (
                            <Tile
                              key={email.id}
                              style={{
                                borderLeft: '4px solid var(--cds-support-success)',
                              }}
                            >
                              <Stack gap={3}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => handleEmailClick(email)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                      <h3 style={{ fontWeight: 600 }}>
                                        {email.subject || '(No Subject)'}
                                      </h3>
                                      <Tag type="green" size="sm">Assigned</Tag>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                      From: {email.fromName} &lt;{email.fromAddress}&gt;
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                                      {new Date(email.receivedAt).toLocaleString()}
                                    </p>
                                    {assignedUsers.length > 0 && (
                                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                                        Assigned to:{' '}
                                        {assignedUsers
                                          .map((u) => `${u.firstName} ${u.lastName}`)
                                          .join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <div style={{ marginLeft: '1rem' }}>
                                    <Select
                                      id={`reassign-${email.id}`}
                                      labelText=""
                                      hideLabel
                                      value=""
                                      onChange={(e) => {
                                        handleAssignToRole(email.id, e.target.value);
                                      }}
                                      disabled={assigning && assigningEmailId === email.id}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <SelectItem
                                        value=""
                                        text={
                                          assigning && assigningEmailId === email.id
                                            ? 'Reassigning...'
                                            : 'Reassign to Role...'
                                        }
                                      />
                                      {projectRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id} text={role.name} />
                                      ))}
                                    </Select>
                                  </div>
                                </div>
                              </Stack>
                            </Tile>
                          );
                        })
                      )}
                    </Stack>
                  )}
                </div>
              </Stack>
            </div>
          )}

          {activeTab === (isProjectManager ? 2 : 1) && (
            <div>
              <Stack gap={4} style={{ marginTop: '1rem' }}>
                <Heading style={{ fontSize: '1.125rem' }}>Files & Links Timeline</Heading>
                <Tile>
                  <p style={{ color: 'var(--cds-text-secondary)' }}>
                    Files and links timeline will be displayed here once email
                    attachments and link extraction are implemented.
                  </p>
                </Tile>
              </Stack>
            </div>
          )}
        </div>
      </div>

      {/* Email Detail Modal */}
      {emailDetail && (
        <Modal
          open={!!emailDetail}
          modalHeading="Email Details"
          primaryButtonText="Close"
          onRequestClose={() => setEmailDetail(null)}
          onRequestSubmit={() => setEmailDetail(null)}
          size="lg"
        >
          <Stack gap={4}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Subject:</p>
              <p>{emailDetail.subject || '(No Subject)'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>From:</p>
              <p>
                {emailDetail.fromName} &lt;{emailDetail.fromAddress}&gt;
              </p>
            </div>
            {emailDetail.toAddresses && emailDetail.toAddresses.length > 0 && (
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>To:</p>
                <p>{emailDetail.toAddresses.join(', ')}</p>
              </div>
            )}
            {emailDetail.ccAddresses && emailDetail.ccAddresses.length > 0 && (
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>CC:</p>
                <p>{emailDetail.ccAddresses.join(', ')}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Received:</p>
              <p>{new Date(emailDetail.receivedAt).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Body:</p>
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  border: '1px solid var(--cds-border-subtle-01)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    emailDetail.bodyHtml ||
                    emailDetail.body.replace(/\n/g, '<br>'),
                }}
              />
            </div>
          </Stack>
        </Modal>
      )}
    </Stack>
  );
}
