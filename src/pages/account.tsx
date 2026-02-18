import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { trpc } from '@/lib/trpc';
import Head from 'next/head';
import Link from 'next/link';

export default function Account() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>(
    'profile'
  );

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Load profile
  const { data: profile, isLoading } = trpc.user.profile.useQuery();

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email);
    }
  }, [profile]);

  // Mutations
  const updateProfile = trpc.user.update.useMutation({
    onSuccess: () => {
      setProfileSuccess(true);
      setProfileError('');
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (error) => {
      setProfileError(error.message);
    },
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error) => {
      setPasswordError(error.message);
    },
  });

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.push('/');
    },
    onError: (error) => {
      setDeleteError(error.message);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: name || undefined,
      email: email || undefined,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    changePassword.mutate({
      oldPassword,
      newPassword,
    });
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }

    if (confirm('Are you absolutely sure? This cannot be undone.')) {
      deleteAccount.mutate({ password: deletePassword });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Account Settings - SnapLink</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-indigo-600 hover:underline">
                ← Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-8 flex gap-4 border-b border-gray-200">
            {['profile', 'password', 'danger'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'profile' && 'Profile'}
                {tab === 'password' && 'Password'}
                {tab === 'danger' && 'Danger Zone'}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {profileError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    Profile updated successfully
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updateProfile.isLoading}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, uppercase, lowercase, number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {passwordError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    Password changed successfully
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changePassword.isLoading}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {changePassword.isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-red-900">
                Danger Zone
              </h2>

              {!deleteConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm text-red-800">
                    Deleting your account is permanent and cannot be undone. All your
                    links and analytics data will be deleted.
                  </p>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <p className="text-sm font-semibold text-red-900">
                    Are you absolutely sure? This cannot be undone.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-red-900">
                      Confirm with your password
                    </label>
                    <input
                      type="password"
                      required
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-lg border border-red-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  {deleteError && (
                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={deleteAccount.isLoading}
                      className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteAccount.isLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirm(false);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      className="rounded-lg border border-red-300 px-6 py-2 text-red-900 hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
