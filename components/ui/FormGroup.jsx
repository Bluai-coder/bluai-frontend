import React from 'react';

export function FormGroup({ children, className = '' }) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
}
