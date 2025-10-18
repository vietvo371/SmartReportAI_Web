'use client';

import { useState } from 'react';

export default function RoleTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const testCitizenAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/citizen/reports');
      const data = await response.json();
      setResult(`Citizen API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Citizen API Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStaffAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/staff/assigned-reports');
      const data = await response.json();
      setResult(`Staff API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Staff API Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      setResult(`Admin API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Admin API Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAIAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: 'https://example.com/test-image.jpg',
        }),
      });
      const data = await response.json();
      setResult(`AI API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`AI API Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">Role API Tester</h3>
      <div className="space-y-2">
        <button
          onClick={testCitizenAPI}
          disabled={isLoading}
          className="bg-white text-blue-500 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-100 disabled:opacity-50"
        >
          Test Citizen
        </button>
        <button
          onClick={testStaffAPI}
          disabled={isLoading}
          className="bg-white text-blue-500 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-100 disabled:opacity-50"
        >
          Test Staff
        </button>
        <button
          onClick={testAdminAPI}
          disabled={isLoading}
          className="bg-white text-blue-500 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-100 disabled:opacity-50"
        >
          Test Admin
        </button>
        <button
          onClick={testAIAPI}
          disabled={isLoading}
          className="bg-white text-blue-500 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-100 disabled:opacity-50"
        >
          Test AI
        </button>
      </div>
      {result && (
        <div className="mt-2 p-2 bg-black bg-opacity-50 rounded text-xs max-h-32 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
