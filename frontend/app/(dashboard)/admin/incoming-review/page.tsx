'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  incomingReviewApi,
  UnassignedEmail,
} from '@/lib/api/incoming-review';
import { projectsApi } from '@/lib/api/projects';
import { emailsApi, Email } from '@/lib/api/emails';
import {
  TextInput,
  Button,
  Select,
  SelectItem,
  Tile,
  Tag,
  Loading,
  Modal,
  Stack,
  Heading,
} from '@carbon/react';
import { ArrowLeft, Watson, CheckmarkFilled } from '@carbon/icons-react';

export default function IncomingReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [emails, setEmails] = useState<UnassignedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [processingAI, setProcessingAI] = useState(false);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<Email | null>(null);
  const [pendingAssignments, setPendingAssignments] = useState<Map<string, string>>(new Map());
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [filters, setFilters] = useState({
    spamStatus: '',
    search: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await incomingReviewApi.getUnassignedEmails(filters);
      setEmails(data);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsApi.getDashboard();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.globalRole !== 'super_user') {
      router.push('/dashboard');
      return;
    }
    setPendingAssignments(new Map());
    loadData();
    loadProjects();
  }, [filters, loadData, loadProjects, user?.globalRole, router]);

  const handleAssignToProject = (emailId: string, projectId: string) => {
    const newPendingAssignments = new Map(pendingAssignments);
    if (!projectId || projectId === '') {
      newPendingAssignments.set(emailId, '');
    } else {
      newPendingAssignments.set(emailId, projectId);
    }
    setPendingAssignments(newPendingAssignments);

    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId
          ? {
              ...email,
              projectId: projectId || null,
              project: projectId
                ? projects.find((p) => p.id === projectId)
                : undefined,
            }
          : email,
      ),
    );
  };

  const handleApplyChanges = async () => {
    if (pendingAssignments.size === 0) {
      return;
    }

    try {
      setApplyingChanges(true);
      const assignments = Array.from(pendingAssignments.entries()).map(
        ([emailId, projectId]) =>
          incomingReviewApi.assignToProject(emailId, projectId || ''),
      );

      await Promise.all(assignments);
      setPendingAssignments(new Map());
      await loadData();
    } catch (error: unknown) {
      console.error('Failed to apply changes:', error);
      const errorWithDetails = error as { response?: { data?: { message?: string } }; message?: string };
      alert(
        `Failed to apply changes: ${
          errorWithDetails.response?.data?.message || errorWithDetails.message || 'Unknown error'
        }`,
      );
    } finally {
      setApplyingChanges(false);
    }
  };

  const handleCancelChanges = () => {
    setPendingAssignments(new Map());
    loadData();
  };

  const handleMarkSpam = async (
    emailId: string,
    spamStatus: 'spam' | 'not_spam',
  ) => {
    try {
      await incomingReviewApi.markSpamStatus(emailId, spamStatus);
      loadData();
    } catch (error) {
      console.error('Failed to mark spam:', error);
    }
  };

  const handleProcessAllWithAI = async () => {
    if (!confirm('Process all unprocessed emails with AI? This may take a few minutes.')) {
      return;
    }

    try {
      setProcessingAI(true);
      const result = await incomingReviewApi.processAllUnprocessedEmails();
      alert(`AI processing complete: ${result.processed} processed, ${result.failed} failed`);
      await loadData();
    } catch (error) {
      console.error('Failed to process emails with AI:', error);
      alert('Failed to process emails with AI. Please try again.');
    } finally {
      setProcessingAI(false);
    }
  };

  const handleProcessEmailWithAI = async (emailId: string) => {
    try {
      setProcessingEmailId(emailId);
      await incomingReviewApi.processEmailWithAI(emailId);
      await loadData();
      alert('Email processed with AI successfully!');
    } catch (error) {
      console.error('Failed to process email with AI:', error);
      alert('Failed to process email with AI. Please try again.');
    } finally {
      setProcessingEmailId(null);
    }
  };

  const handleEmailClick = async (email: UnassignedEmail) => {
    try {
      const fullEmail = await emailsApi.getOne(email.id);
      setEmailDetail(fullEmail);
    } catch (error) {
      console.error('Failed to fetch full email details:', error);
      alert('Failed to load email content.');
    }
  };

  const getSpamTagType = (spamStatus: string): 'red' | 'green' | 'gray' | 'blue' | 'cyan' | 'magenta' | 'purple' | 'teal' | 'cool-gray' | 'warm-gray' | 'high-contrast' | 'outline' | undefined => {
    switch (spamStatus) {
      case 'spam':
        return 'red';
      case 'possible_spam':
        return 'blue'; // Changed from 'yellow' as it's not a valid Carbon Tag type
      case 'not_spam':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap={6}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
          <Heading>Incoming Mail Review</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={Watson}
          onClick={handleProcessAllWithAI}
          disabled={processingAI}
        >
          {processingAI ? 'Processing...' : 'Process All with AI'}
        </Button>
      </div>

      {/* AI Processing Section */}
      <Tile style={{ border: '2px solid var(--cds-support-purple)', backgroundColor: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Watson size={24} style={{ color: 'var(--cds-support-purple)' }} />
          <div>
            <Heading style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>AI Processing</Heading>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              Process all unprocessed emails with AI for spam classification and project routing
            </p>
          </div>
        </div>
      </Tile>

      {/* Pending Changes Bar */}
      {pendingAssignments.size > 0 && (
        <Tile
          style={{
            border: '2px solid var(--cds-support-info)',
            backgroundColor: 'var(--cds-layer-01)',
            position: 'sticky',
            top: '1rem',
            zIndex: 100,
          }}
        >
          <Stack gap={4}>
            <div>
              <Heading style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                {pendingAssignments.size} pending change{pendingAssignments.size !== 1 ? 's' : ''}
              </Heading>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                Click &apos;Apply Changes&apos; to save all updates
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button
                kind="secondary"
                onClick={handleCancelChanges}
                disabled={applyingChanges}
              >
                Cancel
              </Button>
              <Button
                kind="primary"
                renderIcon={CheckmarkFilled}
                onClick={handleApplyChanges}
                disabled={applyingChanges}
              >
                {applyingChanges ? 'Applying...' : 'Apply Changes'}
              </Button>
            </div>
          </Stack>
        </Tile>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <TextInput
          id="search"
          labelText=""
          hideLabel
          placeholder="Search emails..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          style={{ flex: 1 }}
        />
        <Select
          id="spam-status-filter"
          labelText=""
          hideLabel
          value={filters.spamStatus}
          onChange={(e) =>
            setFilters({ ...filters, spamStatus: e.target.value })
          }
        >
          <SelectItem value="" text="All Spam Status" />
          <SelectItem value="not_spam" text="Not Spam" />
          <SelectItem value="possible_spam" text="Possible Spam" />
          <SelectItem value="spam" text="Spam" />
        </Select>
      </div>

      {/* Emails List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading emails" withOverlay={false} />
        </div>
      ) : emails.length === 0 ? (
        <Tile>
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: 'var(--cds-text-secondary)' }}>No unassigned emails found.</p>
          </div>
        </Tile>
      ) : (
        <Stack gap={4}>
          {emails.map((email) => {
            const currentProjectId = pendingAssignments.has(email.id)
              ? pendingAssignments.get(email.id)
              : email.projectId;
            const currentProject = currentProjectId
              ? projects.find((p) => p.id === currentProjectId) || email.project
              : null;

            return (
              <Tile
                key={email.id}
                onClick={() => handleEmailClick(email)}
                style={{ cursor: 'pointer' }}
              >
                <Stack gap={4}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                          {email.subject}
                        </h3>
                        {pendingAssignments.has(email.id) && (
                          <Tag type="blue" size="sm">Pending...</Tag>
                        )}
                        {currentProjectId && currentProject ? (
                          <Tag type="blue" size="sm">
                            Assigned to: {currentProject.name}
                          </Tag>
                        ) : (
                          <Tag type="gray" size="sm">Unassigned</Tag>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        From: {email.fromName} ({email.fromAddress})
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                        {new Date(email.receivedAt).toLocaleString()}
                      </p>
                      {email.aiSuggestedProjectId && !email.projectId && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--cds-link-primary)' }}>
                          AI Suggestion: {email.project?.name} (
                          {Math.round((email.aiProjectConfidence || 0) * 100)}% confidence)
                        </p>
                      )}
                    </div>
                    <Tag type={getSpamTagType(email.spamStatus)} size="sm">
                      {email.spamStatus.replace('_', ' ')}
                    </Tag>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Button
                      kind="tertiary"
                      size="sm"
                      renderIcon={Watson}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessEmailWithAI(email.id);
                      }}
                      disabled={processingEmailId === email.id}
                    >
                      {processingEmailId === email.id ? 'Processing...' : 'Process with AI'}
                    </Button>
                    <Select
                      id={`assign-${email.id}`}
                      labelText=""
                      hideLabel
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleAssignToProject(email.id, e.target.value);
                      }}
                      value={currentProjectId || ''}
                      style={{ minWidth: '200px' }}
                    >
                      <SelectItem
                        value=""
                        text={email.projectId ? 'Unassign from Project' : 'Assign to Project...'}
                      />
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} text={project.name} />
                      ))}
                    </Select>
                    {(email.projectId || pendingAssignments.get(email.id)) && (
                      <Button
                        kind="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToProject(email.id, '');
                        }}
                      >
                        Unassign
                      </Button>
                    )}
                    {email.spamStatus !== 'spam' && (
                      <Button
                        kind="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSpam(email.id, 'spam');
                        }}
                      >
                        Mark as Spam
                      </Button>
                    )}
                    {email.spamStatus === 'spam' && (
                      <Button
                        kind="primary"
                        size="sm"
                        renderIcon={CheckmarkFilled}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSpam(email.id, 'not_spam');
                        }}
                      >
                        Mark as Not Spam
                      </Button>
                    )}
                  </div>
                </Stack>
              </Tile>
            );
          })}
        </Stack>
      )}

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
