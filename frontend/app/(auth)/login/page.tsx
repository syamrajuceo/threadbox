'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
  Stack,
  Tile,
  FormGroup,
  Heading,
  Grid,
  Column,
} from '@carbon/react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--cds-layer-01)',
        backgroundImage: 'linear-gradient(135deg, var(--cds-layer-01) 0%, var(--cds-layer-02) 100%)',
      }}
    >
      <Grid narrow style={{ width: '100%', maxWidth: '28rem' }}>
        <Column lg={16} md={8} sm={4}>
          <Tile
            style={{
              padding: '3rem 2.5rem',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--cds-border-subtle-01)',
            }}
          >
            <Stack gap={7}>
              {/* Header Section */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--cds-interactive-01)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 600,
                  }}
                >
                  T
                </div>
                <Heading style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 600 }}>
                  Welcome back
                </Heading>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--cds-text-secondary)',
                    margin: 0,
                  }}
                >
                  Sign in to continue to Threadbox
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <InlineNotification
                  kind="error"
                  title="Authentication failed"
                  subtitle={error}
                  onClose={() => setError('')}
                  lowContrast
                />
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  <FormGroup legendText="" style={{ marginBottom: 0 }}>
                    <TextInput
                      id="email"
                      labelText="Email address"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={loading}
                      size="lg"
                      invalid={!!error}
                      invalidText=""
                    />
                  </FormGroup>

                  <FormGroup legendText="" style={{ marginBottom: 0 }}>
                    <PasswordInput
                      id="password"
                      labelText="Password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                      size="lg"
                      invalid={!!error}
                      invalidText=""
                    />
                  </FormGroup>

                  <div style={{ marginTop: '0.5rem' }}>
                    <Button
                      type="submit"
                      kind="primary"
                      size="lg"
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </div>
                </Stack>
              </form>

              {/* Footer Note */}
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--cds-text-helper)',
                    margin: 0,
                  }}
                >
                  Secure email management and collaboration platform
                </p>
              </div>
            </Stack>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}

