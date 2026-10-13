import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-[#1b4dff]" />
        </div>
        <h1 className="text-6xl font-black text-[#1b4dff] mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b4dff] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">Go to Dashboard</Link>
      </div>
    </div>
  );
}
