'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function GlobalError({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html><body className="bg-gray-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Critical Error</h1>
          <p className="text-gray-500 mb-6">{error?.message || 'A critical error occurred.'}</p>
          <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b4dff] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
        </div>
      </div>
    </body></html>
  );
}
