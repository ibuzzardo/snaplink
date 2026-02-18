import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { trpc } from '@/lib/trpc';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortened, setShortened] = useState<{ slug: string; shortUrl: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const createLink = trpc.links.create.useMutation({
    onSuccess: (data) => {
      setShortened(data);
      setUrl('');
      setCustomSlug('');
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      createLink.mutate({
        url,
        customSlug: customSlug || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SnapLink - URL Shortener</title>
        <meta name="description" content="Create short, shareable URLs with real-time analytics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="border-b border-gray-200 bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-indigo-600">SnapLink</div>
              <div className="flex gap-4">
                {session ? (
                  <>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => signIn()}
                      className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h1 className="mb-2 text-3xl font-bold">Shorten URLs</h1>
              <p className="mb-6 text-gray-600">
                Create short, trackable links with real-time analytics
              </p>

              {shortened ? (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Your short link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-gray-100 px-3 py-2 font-mono text-sm">
                      {shortened.shortUrl}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shortened.shortUrl);
                        // Toast notification would go here
                      }}
                      className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => setShortened(null)}
                    className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  >
                    Shorten Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleShorten} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL to Shorten</label>
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
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
                    <p className="mt-1 text-xs text-gray-500">3-20 characters, lowercase letters, numbers, hyphens</p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || createLink.isLoading}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading || createLink.isLoading ? 'Shortening...' : 'Shorten URL'}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center shadow">
                <div className="text-2xl font-bold text-indigo-600">⚡</div>
                <p className="mt-2 text-sm font-semibold">Fast</p>
                <p className="text-xs text-gray-600">Instant URL shortening</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow">
                <div className="text-2xl font-bold text-indigo-600">📊</div>
                <p className="mt-2 text-sm font-semibold">Analytics</p>
                <p className="text-xs text-gray-600">Track clicks & insights</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow">
                <div className="text-2xl font-bold text-indigo-600">🔒</div>
                <p className="mt-2 text-sm font-semibold">Secure</p>
                <p className="text-xs text-gray-600">HTTPS & encrypted</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
