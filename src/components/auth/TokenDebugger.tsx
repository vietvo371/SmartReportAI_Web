'use client';

import { useState } from 'react';

export default function TokenDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const clearTokens = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/force-logout', {
        method: 'POST',
      });
      
      const data = await response.json();
      setMessage(data.message || 'Success');
      
      // Reload page to clear any cached state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setMessage('Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold mb-2">Token Debugger</h3>
      <p className="text-sm mb-2">Clear old tokens and force logout</p>
      <button
        onClick={clearTokens}
        disabled={isLoading}
        className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {isLoading ? 'Clearing...' : 'Clear Tokens'}
      </button>
      {message && (
        <p className="text-xs mt-2 text-yellow-200">{message}</p>
      )}
    </div>
  );
}
