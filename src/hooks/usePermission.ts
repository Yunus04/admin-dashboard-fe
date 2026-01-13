import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { RolePermissions, UserRole } from '@/types/models';

// Default permissions based on role
const rolePermissions: Record<UserRole, RolePermissions> = {
    super_admin: {
        canViewUsers: true,
        canCreateUsers: true,
        canUpdateUsers: true,
        canDeleteUsers: true,
        canViewMerchants: true,
        canCreateMerchants: true,
        canUpdateMerchants: true,
        canDeleteMerchants: true,
        canViewAllMerchants: true,
    },
    admin: {
        canViewUsers: false,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canViewMerchants: true,
        canCreateMerchants: true,
        canUpdateMerchants: true,
        canDeleteMerchants: true,
        canViewAllMerchants: true,
    },
    merchant: {
        canViewUsers: false,
        canCreateUsers: false,
        canUpdateUsers: false,
        canDeleteUsers: false,
        canViewMerchants: true,
        canCreateMerchants: false,
        canUpdateMerchants: false,
        canDeleteMerchants: false,
        canViewAllMerchants: false,
    },
};

export function usePermission() {
    const { user } = useAuth();

    const getPermissions = useCallback((): RolePermissions => {
        if (!user) {
            return {
                canViewUsers: false,
                canCreateUsers: false,
                canUpdateUsers: false,
                canDeleteUsers: false,
                canViewMerchants: false,
                canCreateMerchants: false,
                canUpdateMerchants: false,
                canDeleteMerchants: false,
                canViewAllMerchants: false,
            };
        }

        return rolePermissions[user.role] || rolePermissions.merchant;
    }, [user]);

    const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
        const permissions = getPermissions();
        return permissions[permission] ?? false;
    }, [getPermissions]);

    const isSuperAdmin = useCallback((): boolean => {
        return user?.role === 'super_admin';
    }, [user]);

    const isAdmin = useCallback((): boolean => {
        return user?.role === 'admin';
    }, [user]);

    const isMerchant = useCallback((): boolean => {
        return user?.role === 'merchant';
    }, [user]);

    const canAccessRoute = useCallback((requiredRoles: UserRole[]): boolean => {
        if (!user) return false;
        return requiredRoles.includes(user.role);
    }, [user]);

    return {
        user,
        permissions: getPermissions(),
        hasPermission,
        isSuperAdmin,
        isAdmin,
        isMerchant,
        canAccessRoute,
    };
}

