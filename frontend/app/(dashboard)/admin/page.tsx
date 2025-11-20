'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  Tile,
  Button,
  Modal,
  Stack,
  PasswordInput,
  InlineNotification,
  Heading,
  Grid,
  Column,
} from '@carbon/react';
import { Email, User, Folder, Security, UserMultiple } from '@carbon/icons-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.globalRole !== 'super_user') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.globalRole !== 'super_user') {
    return null;
  }

  return (
    <Stack gap={6}>
      <div>
        <Heading>Admin Panel</Heading>
        <p style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
          Manage system settings and review incoming emails
        </p>
      </div>

      <Grid>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/incoming-review" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <Email size={32} style={{ color: 'var(--cds-interactive-01)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Incoming Mail Review</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Review and assign unassigned emails
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/users" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <User size={32} style={{ color: 'var(--cds-support-success)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>User Management</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Create, edit, and manage users
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/projects" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <Folder size={32} style={{ color: 'var(--cds-support-purple)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Project Management</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Create and manage projects
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/roles" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <Security size={32} style={{ color: 'var(--cds-support-warning)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Role Management</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Create and manage project roles
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/memberships" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <UserMultiple size={32} style={{ color: 'var(--cds-interactive-02)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Membership Management</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Assign users to projects with roles
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Link href="/admin/email-ingestion" style={{ textDecoration: 'none', display: 'block' }}>
            <Tile style={{ height: '100%', cursor: 'pointer' }}>
              <Stack gap={3}>
                <Email size={32} style={{ color: 'var(--cds-support-info)' }} />
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email Ingestion</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Configure and trigger email ingestion from Gmail, Outlook, or IMAP
                  </p>
                </div>
              </Stack>
            </Tile>
          </Link>
        </Column>
      </Grid>

      {/* AI Connection Test Section */}
      <AIConnectionTest />

      {/* Global Reset Section */}
      <GlobalResetSection />
    </Stack>
  );
}

// AI Connection Test Component
function AIConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    responseTime?: number;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const { aiApi } = await import('@/lib/api/ai');
      const testResult = await aiApi.testConnection();
      
      setResult({
        success: testResult.success,
        message: testResult.message || 'Connection test completed',
        responseTime: testResult.details?.responseTime,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to test AI connection',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Tile>
      <Stack gap={4}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Heading style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>AI Connection Test</Heading>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              Test if Claude AI is properly configured and accessible
            </p>
          </div>
          <Button
            kind="primary"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {result && (
          <InlineNotification
            kind={result.success ? 'success' : 'error'}
            title={result.success ? 'Connection Successful' : 'Connection Failed'}
            subtitle={
              result.success && result.responseTime
                ? `${result.message} (Response time: ${result.responseTime}ms)`
                : result.message
            }
            lowContrast
          />
        )}
      </Stack>
    </Tile>
  );
}

// Global Reset Section Component
function GlobalResetSection() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    deletedCount?: number;
  } | null>(null);

  const handleResetClick = () => {
    setShowConfirmModal(true);
    setPassword('');
    setResult(null);
  };

  const handleConfirmReset = async () => {
    if (!password.trim()) {
      alert('Please enter your password to confirm');
      return;
    }

    // Final confirmation
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL emails from the database. This action cannot be undone!\n\nAre you absolutely sure you want to continue?',
    );

    if (!confirmed) {
      return;
    }

    setResetting(true);
    setResult(null);

    try {
      const { emailsApi } = await import('@/lib/api/emails');
      const resetResult = await emailsApi.resetAll(password);

      setResult({
        success: resetResult.success,
        message: resetResult.message,
        deletedCount: resetResult.deletedCount,
      });

      setShowConfirmModal(false);
      setPassword('');

      // Show success message
      alert(
        `✅ Successfully deleted ${resetResult.deletedCount} email(s). The database has been reset.`,
      );
    } catch (error: any) {
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to reset emails. Please check your password and try again.',
      });
    } finally {
      setResetting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setPassword('');
    setResult(null);
  };

  return (
    <>
      <Tile
        style={{
          marginTop: '2rem',
          border: '2px solid var(--cds-support-error)',
          backgroundColor: 'var(--cds-layer-01)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-error)', marginBottom: '0.5rem' }}>
              ⚠️ Global Reset
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              Permanently delete all emails from the database. This action cannot be undone!
            </p>
          </div>
          <Button
            kind="danger"
            onClick={handleResetClick}
            size="lg"
          >
            Reset All Emails
          </Button>
        </div>
      </Tile>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          open={showConfirmModal}
          modalHeading="Confirm Global Reset"
          primaryButtonText={resetting ? 'Resetting...' : 'Confirm Reset'}
          secondaryButtonText="Cancel"
          onRequestClose={handleCancel}
          onRequestSubmit={handleConfirmReset}
          primaryButtonDisabled={resetting || !password.trim()}
          danger
        >
          <Stack gap={4}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
              This will permanently delete <strong>ALL emails</strong> from the database, including:
            </p>
            <ul style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)', paddingLeft: '1.5rem', margin: 0 }}>
              <li>All email messages</li>
              <li>All email attachments</li>
              <li>All email assignments</li>
              <li>All email threads</li>
            </ul>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-error)', margin: 0 }}>
              ⚠️ This action cannot be undone!
            </p>

            <div>
              <PasswordInput
                id="reset-password"
                labelText="Enter your admin password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                disabled={resetting}
                size="lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim() && !resetting) {
                    handleConfirmReset();
                  }
                }}
              />
            </div>

            {result && !result.success && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={result.message}
                lowContrast
              />
            )}
          </Stack>
        </Modal>
      )}
    </>
  );
}

