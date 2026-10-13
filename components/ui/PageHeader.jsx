import React from 'react';

export function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        {breadcrumbs && (
          <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-1" aria-label="Breadcrumb">
            {breadcrumbs}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
