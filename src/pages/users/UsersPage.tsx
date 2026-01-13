
import { Outlet } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';

export function UsersPage() {
  const { isSuperAdmin } = usePermission();

  if (!isSuperAdmin()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <Outlet />;
}

