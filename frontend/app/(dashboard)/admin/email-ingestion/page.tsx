'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  EmailProvider,
  GmailCredentials,
  OutlookCredentials,
  ImapCredentials,
} from '@/lib/api/email-ingestion';
import {
  emailAccountsApi,
  EmailAccount,
  CreateEmailAccountDto,
} from '@/lib/api/email-accounts';
import {
  TextInput,
  PasswordInput,
  Button,
  Select,
  SelectItem,
  Tile,
  Tag,
  Loading,
  InlineNotification,
  Stack,
  Grid,
  Column,
  Heading,
  FormGroup,
  Modal,
} from '@carbon/react';
import { Calendar, ArrowLeft, Add, Edit, TrashCan, Warning } from '@carbon/icons-react';

export default function EmailIngestionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [savedAccounts, setSavedAccounts] = useState<EmailAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const [ingestingAccountId, setIngestingAccountId] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Form state for new account
  const [accountName, setAccountName] = useState('');
  const [provider, setProvider] = useState<EmailProvider>('imap');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Gmail credentials
  const [gmailCredentials, setGmailCredentials] = useState<GmailCredentials>({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    refreshToken: '',
  });

  // Outlook credentials
  const [outlookCredentials, setOutlookCredentials] = useState<OutlookCredentials>({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    accessToken: '',
  });

  // IMAP credentials
  const [imapCredentials, setImapCredentials] = useState<ImapCredentials>({
    username: '',
    password: '',
    host: '',
    port: '993',
    tls: true,
  });

  const [sinceDate, setSinceDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.globalRole !== 'super_user') {
      router.push('/dashboard');
      return;
    }
    loadSavedAccounts();
  }, [isAuthenticated, user, router]);

  const loadSavedAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const accounts = await emailAccountsApi.getAll();
      setSavedAccounts(accounts);
    } catch (error) {
      console.error('Error loading saved accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleIngestFromSaved = async (accountId: string) => {
    setIngestingAccountId(accountId);
    setResult(null);

    try {
      console.log('📧 Ingesting emails with date filter:', sinceDate || 'NO DATE (will fetch all)');
      const response = await emailAccountsApi.ingest(accountId, sinceDate || undefined);
      setResult({
        success: response.success,
        message: response.message,
      });
      await loadSavedAccounts();
    } catch (error: unknown) {
      console.error('Email ingestion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to ingest emails';
      
      let errorMessage = 'Failed to ingest emails';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Email ingestion is taking longer than expected. The process may still be running on the server. Please check the backend logs or try again in a few minutes.';
      } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || !error.response) {
        errorMessage = 'Network error. Please check if the backend server is running and accessible on port 3001.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIngestingAccountId(null);
    }
  };

  const handleSaveAndIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let credentials: GmailCredentials | OutlookCredentials | ImapCredentials | undefined;
      
      switch (provider) {
        case 'gmail':
          credentials = gmailCredentials;
          break;
        case 'outlook':
          credentials = outlookCredentials;
          break;
        case 'imap':
          credentials = imapCredentials;
          break;
      }

      const createDto: CreateEmailAccountDto = {
        name: accountName || account,
        provider,
        account,
        credentials,
        redirectUri: provider === 'gmail' || provider === 'outlook' 
          ? (provider === 'gmail' ? gmailCredentials.redirectUri : outlookCredentials.redirectUri)
          : undefined,
        isActive: true,
      };

      const savedAccount = await emailAccountsApi.create(createDto);
      
      if ('error' in savedAccount && savedAccount.error) {
        throw new Error(('message' in savedAccount && savedAccount.message) || 'Failed to create email account');
      }
      
      const response = await emailAccountsApi.ingest(savedAccount.id, sinceDate || undefined);
      
      setResult({
        success: response.success,
        message: response.message,
      });

      // Reset form
      setAccountName('');
      setAccount('');
      setGmailCredentials({ clientId: '', clientSecret: '', redirectUri: '', refreshToken: '' });
      setOutlookCredentials({ clientId: '', clientSecret: '', redirectUri: '', accessToken: '' });
      setImapCredentials({ username: '', password: '', host: '', port: '993', tls: true });
      setSinceDate('');
      setShowNewAccountForm(false);

      await loadSavedAccounts();
    } catch (error: unknown) {
      console.error('Error saving account or ingesting:', error);
      let errorMessage = 'Failed to save account or ingest emails';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || errorMessage;
      }
      
      setResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this email account?')) {
      return;
    }

    try {
      await emailAccountsApi.delete(accountId);
      await loadSavedAccounts();
      setResult({
        success: true,
        message: 'Email account deleted successfully',
      });
    } catch (error: unknown) {
      const errorWithResponse = error as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message: errorWithResponse.response?.data?.message || 'Failed to delete account',
      });
    }
  };

  const handleEditAccount = (acc: EmailAccount) => {
    setEditingAccount(acc);
    setAccountName(acc.name);
    setProvider(acc.provider);
    setAccount(acc.account);
    setSinceDate('');
    
    setGmailCredentials({ clientId: '', clientSecret: '', redirectUri: '', refreshToken: '' });
    setOutlookCredentials({ clientId: '', clientSecret: '', redirectUri: '', accessToken: '' });
    setImapCredentials({ username: '', password: '', host: '', port: '993', tls: true });
    
    setShowNewAccountForm(false);
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccount('');
    setProvider('imap');
    setGmailCredentials({ clientId: '', clientSecret: '', redirectUri: '', refreshToken: '' });
    setOutlookCredentials({ clientId: '', clientSecret: '', redirectUri: '', accessToken: '' });
    setImapCredentials({ username: '', password: '', host: '', port: '993', tls: true });
    setSinceDate('');
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setLoading(true);
    setResult(null);

    try {
      let credentials: any = undefined;
      
      const hasGmailCreds = provider === 'gmail' && gmailCredentials.clientId && gmailCredentials.clientSecret;
      const hasOutlookCreds = provider === 'outlook' && outlookCredentials.clientId && outlookCredentials.clientSecret;
      const hasImapCreds = provider === 'imap' && imapCredentials.username && imapCredentials.password;
      
      if (hasGmailCreds || hasOutlookCreds || hasImapCreds) {
        switch (provider) {
          case 'gmail':
            credentials = gmailCredentials;
            break;
          case 'outlook':
            credentials = outlookCredentials;
            break;
          case 'imap':
            credentials = imapCredentials;
            break;
        }
      }

      const updateDto: Partial<CreateEmailAccountDto> & { credentials?: GmailCredentials | OutlookCredentials | ImapCredentials } = {
        name: accountName || account,
        provider,
        account,
        redirectUri: provider === 'gmail' || provider === 'outlook' 
          ? (provider === 'gmail' ? gmailCredentials.redirectUri : outlookCredentials.redirectUri)
          : undefined,
      };

      if (credentials) {
        updateDto.credentials = credentials;
      }

      await emailAccountsApi.update(editingAccount.id, updateDto);
      
      setResult({
        success: true,
        message: 'Email account updated successfully',
      });

      handleCancelEdit();
      await loadSavedAccounts();
    } catch (error: unknown) {
      console.error('Error updating account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || errorMessage;
      }
      
      setResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated || user?.globalRole !== 'super_user') {
    return null;
  }

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
          <Heading>Email Ingestion</Heading>
        </div>
        <Button
          kind="primary"
          renderIcon={showNewAccountForm ? undefined : Add}
          onClick={() => setShowNewAccountForm(!showNewAccountForm)}
        >
          {showNewAccountForm ? 'Cancel' : 'Add New Account'}
        </Button>
      </div>

      {/* Saved Accounts Section */}
      <Stack gap={4}>
        <div>
          <Heading style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Saved Email Accounts</Heading>
          <p style={{ color: 'var(--cds-text-secondary)' }}>
            Click &quot;Ingest&quot; to fetch emails from a saved account
          </p>
        </div>

        {/* Date Filter */}
        <Tile style={{ border: '2px solid var(--cds-link-primary)', backgroundColor: 'var(--cds-layer-01)' }}>
          <Stack gap={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={24} style={{ color: 'var(--cds-link-primary)' }} />
              <div>
                <Heading style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Date Filter</Heading>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Set a date to fetch only emails received after that date
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <TextInput
                  id="since-date"
                  labelText="Fetch Emails Since"
                  type="datetime-local"
                  value={sinceDate}
                  onChange={(e) => setSinceDate(e.target.value)}
                  helperText={!sinceDate ? '💡 Leave empty to fetch all emails from the account' : undefined}
                />
                {sinceDate && (
                  <InlineNotification
                    kind="info"
                    title="Date Filter Active"
                    subtitle={`Will fetch emails after: ${new Date(sinceDate).toLocaleString()}`}
                    style={{ marginTop: '1rem' }}
                  />
                )}
              </div>
              {sinceDate && (
                <Button
                  kind="danger"
                  onClick={() => setSinceDate('')}
                  style={{ marginTop: '2rem' }}
                >
                  Clear
                </Button>
              )}
            </div>
          </Stack>
        </Tile>

        {/* Accounts List */}
        {loadingAccounts ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Loading description="Loading accounts" withOverlay={false} />
          </div>
        ) : savedAccounts.length === 0 ? (
          <InlineNotification
            kind="warning"
            title="No Accounts"
            subtitle="No saved accounts yet. Click 'Add New Account' to create one."
          />
        ) : (
          <Grid>
            {savedAccounts.map((acc) => (
              <Column key={acc.id} lg={4} md={4} sm={4}>
                <Tile style={{ height: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Stack gap={4} style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '1.125rem', minHeight: '1.5rem' }}>
                          {acc.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', minHeight: '1.25rem' }}>
                          {acc.account}
                        </p>
                      </div>
                      <Tag type={acc.isActive ? 'green' : 'gray'} size="sm">
                        {acc.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    </div>

                    <div style={{ flex: 1, minHeight: '3rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                        <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--cds-text-primary)' }}>Provider:</strong>{' '}
                          <span style={{ textTransform: 'capitalize' }}>{acc.provider}</span>
                        </p>
                        <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--cds-text-primary)' }}>Last ingested:</strong>{' '}
                          {formatDate(acc.lastIngestedAt)}
                        </p>
                        {acc.lastIngestedCount !== null && (
                          <p style={{ margin: 0 }}>
                            <strong style={{ color: 'var(--cds-text-primary)' }}>Last count:</strong>{' '}
                            {acc.lastIngestedCount} emails
                          </p>
                        )}
                      </div>
                    </div>

                    <Stack gap={2} style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <Button
                        kind="primary"
                        size="sm"
                        onClick={() => handleIngestFromSaved(acc.id)}
                        disabled={ingestingAccountId === acc.id || !acc.isActive}
                        style={{ width: '100%' }}
                      >
                        {ingestingAccountId === acc.id ? 'Ingesting...' : 'Ingest'}
                      </Button>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          kind="secondary"
                          size="sm"
                          renderIcon={Edit}
                          onClick={() => handleEditAccount(acc)}
                          style={{ flex: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          kind="danger"
                          size="sm"
                          renderIcon={TrashCan}
                          onClick={() => handleDeleteAccount(acc.id)}
                          style={{ flex: 1 }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Stack>
                  </Stack>
                </Tile>
              </Column>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Result Message */}
      {result && (
        <InlineNotification
          kind={result.success ? 'success' : 'error'}
          title={result.success ? 'Success' : 'Error'}
          subtitle={result.message}
          onClose={() => setResult(null)}
        />
      )}

      {/* New Account Form or Edit Form */}
      {(showNewAccountForm || editingAccount) && (
        <Tile>
          <Stack gap={6}>
            <Heading style={{ fontSize: '1.25rem' }}>
              {editingAccount ? 'Edit Email Account' : 'Add New Email Account'}
            </Heading>
            
            <form onSubmit={editingAccount ? handleUpdateAccount : handleSaveAndIngest}>
              <Stack gap={6}>
                <FormGroup legendText="">
                  <TextInput
                    id="account-name"
                    labelText="Account Name (optional)"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="My Gmail Account"
                    helperText="A friendly name to identify this account. If left empty, the email address will be used."
                  />
                </FormGroup>

                <FormGroup legendText="">
                  <Select
                    id="provider"
                    labelText="Email Provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as EmailProvider)}
                  >
                    <SelectItem value="imap" text="IMAP/SMTP (Generic)" />
                    <SelectItem value="gmail" text="Gmail" />
                    <SelectItem value="outlook" text="Outlook/Microsoft 365" />
                  </Select>
                </FormGroup>

                <FormGroup legendText="">
                  <TextInput
                    id="account-email"
                    labelText="Email Account"
                    type="email"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </FormGroup>

                {/* Gmail Credentials */}
                {provider === 'gmail' && (
                  <Stack gap={4} style={{ borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '1rem' }}>
                    <Heading style={{ fontSize: '1.125rem' }}>Gmail API Credentials</Heading>
                    
                    <InlineNotification
                      kind="warning"
                      title="⚠️ CRITICAL: Redirect URI Must Match Exactly"
                      subtitle={
                        <div style={{ marginTop: '0.5rem' }}>
                          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>If you used <strong>OAuth 2.0 Playground</strong> to get your refresh token, you MUST use: <code style={{ backgroundColor: 'var(--cds-layer-02)', padding: '0.125rem 0.25rem', borderRadius: '2px' }}>https://developers.google.com/oauthplayground</code></li>
                            <li>This redirect URI must match EXACTLY what you used in OAuth Playground</li>
                            <li>It must also be added to your Google Cloud Console OAuth client&apos;s authorized redirect URIs</li>
                            <li><strong>Common error:</strong> Using a different redirect URI will cause &quot;unauthorized_client&quot; error</li>
                          </ul>
                        </div>
                      }
                    />
                    
                    <TextInput
                      id="gmail-client-id"
                      labelText="Client ID"
                      required
                      value={gmailCredentials.clientId}
                      onChange={(e) =>
                        setGmailCredentials({
                          ...gmailCredentials,
                          clientId: e.target.value,
                        })
                      }
                      placeholder="123456789-abc.apps.googleusercontent.com"
                    />
                    
                    <PasswordInput
                      id="gmail-client-secret"
                      labelText="Client Secret"
                      required
                      value={gmailCredentials.clientSecret}
                      onChange={(e) =>
                        setGmailCredentials({
                          ...gmailCredentials,
                          clientSecret: e.target.value,
                        })
                      }
                      placeholder="GOCSPX-xxxxxxxxxxxx"
                    />
                    
                    <TextInput
                      id="gmail-redirect-uri"
                      labelText="Redirect URI"
                      required
                      value={gmailCredentials.redirectUri}
                      onChange={(e) =>
                        setGmailCredentials({
                          ...gmailCredentials,
                          redirectUri: e.target.value,
                        })
                      }
                      placeholder="https://developers.google.com/oauthplayground"
                      helperText="If using OAuth Playground, use: https://developers.google.com/oauthplayground"
                    />
                    
                    <PasswordInput
                      id="gmail-refresh-token"
                      labelText="Refresh Token"
                      required
                      value={gmailCredentials.refreshToken}
                      onChange={(e) =>
                        setGmailCredentials({
                          ...gmailCredentials,
                          refreshToken: e.target.value,
                        })
                      }
                      placeholder="1//0xxxxxxxxxxxx"
                      helperText="Get refresh token from Google OAuth 2.0 Playground or implement OAuth flow"
                    />
                  </Stack>
                )}

                {/* Outlook Credentials */}
                {provider === 'outlook' && (
                  <Stack gap={4} style={{ borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '1rem' }}>
                    <Heading style={{ fontSize: '1.125rem' }}>Outlook/Microsoft 365 Credentials</Heading>
                    
                    <TextInput
                      id="outlook-client-id"
                      labelText="Client ID (Application ID)"
                      required
                      value={outlookCredentials.clientId}
                      onChange={(e) =>
                        setOutlookCredentials({
                          ...outlookCredentials,
                          clientId: e.target.value,
                        })
                      }
                      placeholder="12345678-1234-1234-1234-123456789abc"
                    />
                    
                    <PasswordInput
                      id="outlook-client-secret"
                      labelText="Client Secret"
                      required
                      value={outlookCredentials.clientSecret}
                      onChange={(e) =>
                        setOutlookCredentials({
                          ...outlookCredentials,
                          clientSecret: e.target.value,
                        })
                      }
                      placeholder="abc~xxxxxxxxxxxx"
                    />
                    
                    <TextInput
                      id="outlook-redirect-uri"
                      labelText="Redirect URI"
                      required
                      value={outlookCredentials.redirectUri}
                      onChange={(e) =>
                        setOutlookCredentials({
                          ...outlookCredentials,
                          redirectUri: e.target.value,
                        })
                      }
                      placeholder="http://localhost:3001/auth/outlook/callback"
                    />
                    
                    <PasswordInput
                      id="outlook-access-token"
                      labelText="Access Token"
                      required
                      value={outlookCredentials.accessToken}
                      onChange={(e) =>
                        setOutlookCredentials({
                          ...outlookCredentials,
                          accessToken: e.target.value,
                        })
                      }
                      placeholder="eyJ0eXAiOiJKV1QiLCJub..."
                    />
                  </Stack>
                )}

                {/* IMAP Credentials */}
                {provider === 'imap' && (
                  <Stack gap={4} style={{ borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '1rem' }}>
                    <Heading style={{ fontSize: '1.125rem' }}>IMAP Credentials</Heading>
                    
                    <TextInput
                      id="imap-username"
                      labelText="Username/Email"
                      required
                      value={imapCredentials.username}
                      onChange={(e) =>
                        setImapCredentials({
                          ...imapCredentials,
                          username: e.target.value,
                        })
                      }
                      placeholder="your-email@example.com"
                    />
                    
                    <PasswordInput
                      id="imap-password"
                      labelText="Password"
                      required
                      value={imapCredentials.password}
                      onChange={(e) =>
                        setImapCredentials({
                          ...imapCredentials,
                          password: e.target.value,
                        })
                      }
                      placeholder="your-password or app-specific-password"
                    />
                    
                    <TextInput
                      id="imap-host"
                      labelText="IMAP Host"
                      required
                      value={imapCredentials.host}
                      onChange={(e) =>
                        setImapCredentials({
                          ...imapCredentials,
                          host: e.target.value,
                        })
                      }
                      placeholder="imap.gmail.com or imap-mail.outlook.com"
                    />
                    
                    <Grid>
                      <Column lg={8} md={4} sm={4}>
                        <TextInput
                          id="imap-port"
                          labelText="Port"
                          value={imapCredentials.port}
                          onChange={(e) =>
                            setImapCredentials({
                              ...imapCredentials,
                              port: e.target.value,
                            })
                          }
                          placeholder="993"
                        />
                      </Column>
                      <Column lg={8} md={4} sm={4}>
                        <Select
                          id="imap-tls"
                          labelText="Use TLS/SSL"
                          value={imapCredentials.tls ? 'true' : 'false'}
                          onChange={(e) =>
                            setImapCredentials({
                              ...imapCredentials,
                              tls: e.target.value === 'true',
                            })
                          }
                        >
                          <SelectItem value="true" text="Yes (Recommended)" />
                          <SelectItem value="false" text="No" />
                        </Select>
                      </Column>
                    </Grid>
                  </Stack>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                  <Button
                    type="submit"
                    kind="primary"
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading 
                      ? (editingAccount ? 'Updating...' : 'Saving & Ingesting...') 
                      : (editingAccount ? 'Update Account' : 'Save Account & Ingest Emails')}
                  </Button>
                  {editingAccount && (
                    <Button
                      type="button"
                      kind="secondary"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                {editingAccount && (
                  <InlineNotification
                    kind="info"
                    title="Note"
                    subtitle="Leave credential fields empty to keep existing credentials. Only fill them if you want to update them."
                  />
                )}
              </Stack>
            </form>
          </Stack>
        </Tile>
      )}

      {/* Global Reset Section */}
      <GlobalResetSection />
    </Stack>
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
    } catch (error: unknown) {
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
          marginTop: '1rem',
          border: '2px solid var(--cds-support-error)',
          backgroundColor: 'var(--cds-layer-01)',
        }}
      >
        <Stack gap={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Warning size={24} style={{ color: 'var(--cds-support-error)' }} />
            <div style={{ flex: 1 }}>
              <Heading style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-error)', marginBottom: '0.5rem' }}>
                Global Email Reset
              </Heading>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                Permanently delete all emails from the database. This action cannot be undone!
              </p>
            </div>
            <Button
              kind="danger"
              onClick={handleResetClick}
              size="lg"
              renderIcon={TrashCan}
            >
              Reset All Emails
            </Button>
          </div>
        </Stack>
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
              <li>All email notes</li>
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
