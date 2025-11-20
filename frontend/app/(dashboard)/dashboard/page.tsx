'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/lib/hooks/useProjects';
import Link from 'next/link';
import {
  Tile,
  Tag,
  Loading,
  InlineNotification,
  Stack,
  Grid,
  Column,
  Heading,
} from '@carbon/react';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, loading, error } = useProjects();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Stack gap={6}>
      <div>
        <Heading>Projects</Heading>
        <p style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>
          Select a project to view emails and collaborate
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loading description="Loading projects" withOverlay={false} />
        </div>
      )}

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
        />
      )}

      {!loading && !error && projects.length === 0 && (
        <Tile>
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ color: 'var(--cds-text-secondary)' }}>
              No projects found.
            </p>
          </div>
        </Tile>
      )}

      {!loading && !error && projects.length > 0 && (
        <Grid>
          {projects.map((project) => (
            <Column key={project.id} lg={4} md={4} sm={4}>
              <Link
                href={`/projects/${project.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <Tile style={{ height: '280px', cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Stack gap={4} style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '1.125rem', minHeight: '1.5rem' }}>
                          {project.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', minHeight: '1.25rem' }}>
                          {project.clientName}
                        </p>
                      </div>
                      <Tag type="blue" size="sm">
                        {project.role}
                      </Tag>
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

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-secondary)',
                        marginTop: 'auto',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <span>{project.openEmailsCount} open emails</span>
                      <span>Updated {formatDate(project.lastUpdated)}</span>
                    </div>
                  </Stack>
                </Tile>
              </Link>
            </Column>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

