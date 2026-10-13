'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
      <div className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
        Page <span className="font-medium text-slate-900 dark:text-white">{currentPage}</span> of{' '}
        <span className="font-medium text-slate-900 dark:text-white">{totalPages}</span>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b4dff]/50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        
        <div className="sm:hidden text-sm text-slate-600 dark:text-slate-400">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b4dff]/50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
