'use client';

import React from 'react';
import { Search } from 'lucide-react';

export function SearchFilterBar({ 
  searchValue, 
  onSearchChange, 
  placeholder = 'Search...', 
  filters, 
  actions 
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row flex-1 gap-3">
        {onSearchChange && (
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4dff] focus:border-[#1b4dff] sm:text-sm transition-colors"
              placeholder={placeholder}
            />
          </div>
        )}
        
        {filters && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filters}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
