// @ts-nocheck
import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import Head from 'next/head';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

export default function LinkAnalytics() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session } = useSession();

  const { data: analytics, isLoading } = trpc.analytics.get.useQuery(
    { slug: slug as string, period: 'day' },
    { enabled: !!slug }
  );

  if (!slug) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Link not found</p>
          <Link href="/dashboard" className="mt-4 text-indigo-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const deviceColors: { [key: string]: string } = {
    mobile: '#4f46e5',
    tablet: '#7c3aed',
    desktop: '#10b981',
  };

  const deviceData = Object.entries(analytics.deviceBreakdown).map(
    ([device, count]) => ({
      name: device.charAt(0).toUpperCase() + device.slice(1),
      value: count,
    })
  );

  return (
    <>
      <Head>
        <title>Analytics - {slug} - SnapLink</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/dashboard"
                  className="mb-2 text-indigo-600 hover:underline"
                >
                  ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics: {slug}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Key Metrics */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.totalClicks}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-medium text-gray-600">Unique Clicks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.uniqueClicks}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-medium text-gray-600">CTR</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics.totalClicks > 0
                  ? (
                      (analytics.uniqueClicks / analytics.totalClicks) * 100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="mb-8 grid gap-8 lg:grid-cols-2">
            {/* Clicks Over Time */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Clicks Over Time</h2>
              {analytics.clicksByTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.clicksByTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#4f46e5"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data available</p>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Device Breakdown</h2>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            Object.values(deviceColors)[index % deviceColors.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No data available</p>
              )}
            </div>
          </div>

          {/* Tables */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Top Referrers */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Top Referrers</h2>
              {analytics.topReferrers.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topReferrers.map((referrer) => (
                    <div
                      key={referrer.referrer}
                      className="flex items-center justify-between border-b border-gray-200 py-2"
                    >
                      <span className="text-sm text-gray-700 truncate-2">
                        {referrer.referrer}
                      </span>
                      <span className="ml-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {referrer.clicks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No referrer data</p>
              )}
            </div>

            {/* Top Countries */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Top Countries</h2>
              {analytics.topCountries.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topCountries.map((country) => (
                    <div
                      key={country.country}
                      className="flex items-center justify-between border-b border-gray-200 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {country.country}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {country.clicks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No location data</p>
              )}
            </div>

            {/* Browsers */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Browsers</h2>
              {analytics.browserBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {analytics.browserBreakdown.map((browser) => (
                    <div
                      key={browser.browser}
                      className="flex items-center justify-between border-b border-gray-200 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {browser.browser}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {browser.clicks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No browser data</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
