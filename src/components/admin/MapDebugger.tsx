"use client";

import { useState, useEffect } from "react";

export default function MapDebugger() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setReports(data.reports || []);
      }
    } catch (err) {
      setError('Failed to fetch reports');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-center mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-red-500 text-center">
          <p className="font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Map Debugger
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total reports: <span className="font-semibold text-primary">{reports.length}</span>
          </p>
        </div>
        
        {reports.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Sample report data:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-xs overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(reports[0], null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
