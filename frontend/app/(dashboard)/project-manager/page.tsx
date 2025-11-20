'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  projectManagerApi,
  Project,
  User,
  EmailAssignment,
} from '@/lib/api/project-manager';
import { Email, emailsApi } from '@/lib/api/emails';

export default function ProjectManagerDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [unassignedEmails, setUnassignedEmails] = useState<Email[]>([]);
  const [assignedEmails, setAssignedEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetail, setEmailDetail] = useState<Email | null>(null);
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [emailAssignments, setEmailAssignments] = useState<
    Map<string, EmailAssignment[]>
  >(new Map());
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>(
    'unassigned',
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProjects();
  }, [isAuthenticated, router, loadProjects]);

  useEffect(() => {
    if (selectedProject) {
      loadEmails(selectedProject);
      loadProjectUsers(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectManagerApi.getManagedProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadEmails = async (projectId: string) => {
    try {
      setLoadingEmails(true);
      const [unassigned, assigned] = await Promise.all([
        projectManagerApi.getUnassignedEmails(projectId),
        projectManagerApi.getAssignedEmails(projectId),
      ]);
      setUnassignedEmails(unassigned);
      setAssignedEmails(assigned);

      // Load assignments for all assigned emails
      const assignmentsMap = new Map<string, EmailAssignment[]>();
      for (const email of assigned) {
        try {
          const assignments =
            await projectManagerApi.getEmailAssignments(email.id);
          assignmentsMap.set(email.id, assignments);
        } catch (error) {
          console.error(`Failed to load assignments for email ${email.id}:`, error);
        }
      }
      setEmailAssignments(assignmentsMap);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const loadProjectUsers = async (projectId: string) => {
    try {
      const data = await projectManagerApi.getProjectUsers(projectId);
      setProjectUsers(data);
    } catch (error) {
      console.error('Failed to load project users:', error);
    }
  };

  const handleEmailClick = async (email: Email) => {
    setEmailDetail(email);
    // Load full email details
    try {
      const fullEmail = await emailsApi.getOne(email.id);
      setEmailDetail(fullEmail);
    } catch (error) {
      console.error('Failed to load email details:', error);
    }
  };

  const handleAssignClick = async (email: Email) => {
    setSelectedEmail(email);
    setSelectedUserIds([]);

    // Load current assignments
    try {
      const assignments = await projectManagerApi.getEmailAssignments(
        email.id,
      );
      setSelectedUserIds(assignments.map((a) => a.assignedToId));
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmail || selectedUserIds.length === 0) {
      alert('Please select at least one user to assign');
      return;
    }

    try {
      setAssigning(true);
      await projectManagerApi.assignEmailToMultiple(
        selectedEmail.id,
        selectedUserIds,
      );
      alert('Email assigned successfully!');
      setSelectedEmail(null);
      if (selectedProject) {
        loadEmails(selectedProject);
      }
    } catch (error: unknown) {
      console.error('Failed to assign email:', error);
      const errorWithResponse = error as { response?: { data?: { message?: string } } };
      alert(
        errorWithResponse.response?.data?.message || 'Failed to assign email. Please try again.',
      );
    } finally {
      setAssigning(false);
    }
  };

  const getAssignedUsers = (emailId: string): User[] => {
    const assignments = emailAssignments.get(emailId) || [];
    return assignments.map((a) => a.assignedTo);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Project Manager Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg bg-yellow-50 p-6 text-center text-yellow-800">
            <p className="font-semibold">No Projects Found</p>
            <p className="mt-2 text-sm">
              You are not a project manager for any projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Projects Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Your Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full rounded-md px-4 py-2 text-left text-sm transition-colors ${
                        selectedProject === project.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">
                        {project.clientName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emails Section */}
            <div className="lg:col-span-3">
              {selectedProject ? (
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Project Emails
                    </h2>
                  </div>

                  {/* Tabs */}
                  <div className="mb-4 border-b border-gray-200">
                    <div className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`border-b-2 py-2 px-1 text-sm font-medium ${
                          activeTab === 'unassigned'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Unassigned ({unassignedEmails.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('assigned')}
                        className={`border-b-2 py-2 px-1 text-sm font-medium ${
                          activeTab === 'assigned'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Assigned ({assignedEmails.length})
                      </button>
                    </div>
                  </div>

                  {loadingEmails ? (
                    <div className="py-8 text-center text-gray-500">
                      Loading emails...
                    </div>
                  ) : activeTab === 'unassigned' ? (
                    unassignedEmails.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        No unassigned emails. All emails have been assigned to team members.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unassignedEmails.map((email) => (
                          <div
                            key={email.id}
                            className="rounded-md border border-gray-200 bg-white p-4 hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleEmailClick(email)}
                              >
                                <h3 className="font-semibold text-gray-900">
                                  {email.subject || '(No Subject)'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                  From: {email.fromName} &lt;{email.fromAddress}
                                  &gt;
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(email.receivedAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="ml-4 flex gap-2">
                                <button
                                  onClick={() => handleAssignClick(email)}
                                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                  Assign
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : assignedEmails.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No assigned emails yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedEmails.map((email) => {
                        const assignedUsers = getAssignedUsers(email.id);
                        return (
                          <div
                            key={email.id}
                            className="rounded-md border border-green-200 bg-green-50 p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleEmailClick(email)}
                              >
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {email.subject || '(No Subject)'}
                                  </h3>
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                    Assigned
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  From: {email.fromName} &lt;{email.fromAddress}
                                  &gt;
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(email.receivedAt).toLocaleString()}
                                </p>
                                {assignedUsers.length > 0 && (
                                  <p className="mt-2 text-xs text-gray-600">
                                    Assigned to:{' '}
                                    {assignedUsers
                                      .map(
                                        (u) => `${u.firstName} ${u.lastName}`,
                                      )
                                      .join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => handleAssignClick(email)}
                                  className="rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700"
                                >
                                  Reassign
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-white p-6 shadow text-center text-gray-500">
                  Select a project to view emails
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Detail Modal */}
        {emailDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Email Details</h3>
                <button
                  onClick={() => setEmailDetail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject:</p>
                  <p className="text-gray-900">{emailDetail.subject || '(No Subject)'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">From:</p>
                  <p className="text-gray-900">
                    {emailDetail.fromName} &lt;{emailDetail.fromAddress}&gt;
                  </p>
                </div>
                {emailDetail.toAddresses && emailDetail.toAddresses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">To:</p>
                    <p className="text-gray-900">{emailDetail.toAddresses.join(', ')}</p>
                  </div>
                )}
                {emailDetail.ccAddresses && emailDetail.ccAddresses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">CC:</p>
                    <p className="text-gray-900">{emailDetail.ccAddresses.join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Received:</p>
                  <p className="text-gray-900">
                    {new Date(emailDetail.receivedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Body:</p>
                  <div
                    className="mt-2 rounded-md border border-gray-200 p-4 text-sm text-gray-900"
                    dangerouslySetInnerHTML={{
                      __html: emailDetail.bodyHtml || emailDetail.body.replace(/\n/g, '<br>'),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                Assign Email to Users
              </h3>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Email:</p>
                <p className="text-gray-900">{selectedEmail.subject}</p>
                <p className="mt-1 text-sm text-gray-600">
                  From: {selectedEmail.fromName} &lt;{selectedEmail.fromAddress}&gt;
                </p>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Select Users to Assign:
                </p>
                <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
                  {projectUsers.map((projectUser) => (
                    <label
                      key={projectUser.id}
                      className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(projectUser.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds([
                              ...selectedUserIds,
                              projectUser.id,
                            ]);
                          } else {
                            setSelectedUserIds(
                              selectedUserIds.filter(
                                (id) => id !== projectUser.id,
                              ),
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {projectUser.firstName} {projectUser.lastName} (
                        {projectUser.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedEmail(null);
                    setSelectedUserIds([]);
                  }}
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || selectedUserIds.length === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
