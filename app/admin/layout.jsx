'use client';

import AppLayout from '@/components/layout/AppLayout';
import { adminMenuConfig } from '@/components/layout/menu-config';

export default function AdminLayout({ children }) {
  return (
    <AppLayout menuConfig={adminMenuConfig} permissionAction="*" basePath="/admin">
      {children}
    </AppLayout>
  );
}
