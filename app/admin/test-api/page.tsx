"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function TestAPIPage() {
  const [bookings, setBookings] = useState<any>(null);
  const [photographers, setPhotographers] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testAPIs() {
      setLoading(true);
      setError(null);

      try {
        // Test Booking API
        const bookingResult = await api.bookings.getStats();
        setBookings(bookingResult);

        // Test Photographer API
        const photographerResult = await api.photographers.getStats();
        setPhotographers(photographerResult);

        // Test Notification API
        const notificationResult = await api.notifications.getStats();
        setNotifications(notificationResult);

        if (!bookingResult.success) {
          setError("Failed to fetch data. Backend might not be running.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    testAPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">🔄 Testing APIs...</div>
          <p className="text-gray-600">Connecting to backend at {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-2xl rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold text-red-700">API Connection Failed</h1>
          <p className="mb-4 text-red-600">{error}</p>
          <div className="rounded-lg bg-white p-4 text-left">
            <p className="mb-2 font-semibold">Troubleshooting:</p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
              <li>Make sure backend is running: <code className="bg-gray-100 px-1">cd sudion_backend && npm start</code></li>
              <li>Check API URL in .env.local: <code className="bg-gray-100 px-1">{process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</code></li>
              <li>Test backend directly: <code className="bg-gray-100 px-1">http://localhost:5000/api/admin/bookings/stats</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mb-2 text-3xl font-bold text-green-700">Admin API Working!</h1>
          <p className="text-gray-600">Connected to: {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Booking Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">📅 Booking Stats</h2>
            {bookings?.success ? (
              <div className="space-y-2">
                <StatRow label="Total" value={bookings.data?.total || 0} />
                <StatRow label="Pending" value={bookings.data?.pending || 0} />
                <StatRow label="Confirmed" value={bookings.data?.confirmed || 0} />
                <StatRow label="In Progress" value={bookings.data?.inProgress || 0} />
                <StatRow label="Completed" value={bookings.data?.completed || 0} />
                <StatRow label="Cancelled" value={bookings.data?.cancelled || 0} />
              </div>
            ) : (
              <div className="text-sm text-red-600">Failed to load</div>
            )}
          </div>

          {/* Photographer Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">📸 Photographer Stats</h2>
            {photographers?.success ? (
              <div className="space-y-2">
                <StatRow label="Total" value={photographers.data?.total || 0} />
                <StatRow label="Pending" value={photographers.data?.pending || 0} />
                <StatRow label="Verified" value={photographers.data?.verified || 0} />
                <StatRow label="Rejected" value={photographers.data?.rejected || 0} />
              </div>
            ) : (
              <div className="text-sm text-red-600">Failed to load</div>
            )}
          </div>

          {/* Notification Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">🔔 Notification Stats</h2>
            {notifications?.success ? (
              <div className="space-y-2">
                <StatRow label="Total" value={notifications.data?.total || 0} />
                <StatRow label="Unread" value={notifications.data?.unread || 0} />
                <StatRow label="Booking" value={notifications.data?.booking || 0} />
                <StatRow label="Payment" value={notifications.data?.payment || 0} />
                <StatRow label="System" value={notifications.data?.system || 0} />
              </div>
            ) : (
              <div className="text-sm text-red-600">Failed to load</div>
            )}
          </div>
        </div>

        {/* Raw JSON */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Raw API Responses</h2>
          <div className="space-y-4">
            <details>
              <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                Bookings Response
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-4 text-xs">
                {JSON.stringify(bookings, null, 2)}
              </pre>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                Photographers Response
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-4 text-xs">
                {JSON.stringify(photographers, null, 2)}
              </pre>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-700">
                Notifications Response
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-4 text-xs">
                {JSON.stringify(notifications, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 rounded-xl border-2 border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-green-800">✨ Next Steps</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-green-700">
            <li>APIs are working! You can now use them in your admin pages</li>
            <li>Import api from @/lib/api in your components</li>
            <li>Example: <code className="bg-white px-1">const result = await api.bookings.getAll()</code></li>
            <li>See TEST_ADMIN_API.md for more examples</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
