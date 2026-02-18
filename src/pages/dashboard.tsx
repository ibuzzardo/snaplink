import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { trpc } from '@/lib/trpc';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [page, setPage] = useState(1);
  const [showNewLink, setShowNewLink] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user's links
  const { data: linksData, isLoading } = trpc.links.list.useQuery(
    { page, limit: 10 },
    { enabled: status === 'authenticated' }
  );

  const createLink = trpc.links.create.useMutation({
    onSuccess: (data) => {
      setNewUrl('');
      setCustomSlug('');
      setError('');
      setSuccessMessage('Link created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refetch links
      refetchLinks();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteLink = trpc.links.delete.useMutation({
    onSuccess: () => {
      setError('');
      setSuccessMessage('Link deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetchLinks();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const { refetch: refetchLinks } = trpc.links.list.useQuery(
    { page, limit: 10 },
    { enabled: status === 'authenticated' }
  );

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newUrl) {
      setError('URL is required');
      return;
    }
    createLink.mutate({
      url: newUrl,
      customSlug: customSlug || undefined,
    });
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - SnapLink</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">Welcome, {session?.user?.name}!</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/account"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Create New Link Section */}
          <div className="mb-8">
            {!showNewLink ? (
              <button
                onClick={() => setShowNewLink(true)}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                + Create New Link
              </button>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold">Create New Link</h2>
                <form onSubmit={handleCreateLink} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Long URL
                    </label>
                    <input
                      type="url"
                      required
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/very/long/url"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Slug (Optional)
                    </label>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                      placeholder="custom-slug"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">3-20 characters</p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                      {successMessage}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={createLink.isLoading}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {createLink.isLoading ? 'Creating...' : 'Create Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewLink(false);
                        setError('');
                        setNewUrl('');
                        setCustomSlug('');
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Links Table */}
          <div className="rounded-lg border border-gray-200 bg-white shadow">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold">Your Links</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center px-6 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              </div>
            ) : !linksData?.data || linksData.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No links yet. Create one to get started!
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-t border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Short URL
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Original URL
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {linksData?.data.map((link) => (
                        <tr key={link.slug} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                                {link.slug}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(link.shortUrl);
                                  setSuccessMessage('Copied to clipboard!');
                                  setTimeout(() => setSuccessMessage(''), 2000);
                                }}
                                className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                              >
                                Copy
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate-2 text-sm text-indigo-600 hover:underline"
                              title={link.originalUrl}
                            >
                              {link.originalUrl}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/links/${link.slug}`}
                                className="rounded px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                              >
                                Analytics
                              </Link>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Are you sure you want to delete this link? Analytics will be preserved.'
                                    )
                                  ) {
                                    deleteLink.mutate({ slug: link.slug });
                                  }
                                }}
                                className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Page {linksData?.page} of {linksData?.pages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= (linksData?.pages || 1)}
                      className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
