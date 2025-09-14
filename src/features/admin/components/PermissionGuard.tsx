import { ReactNode } from 'react';
import { useAdminPermissions } from '../hooks/useAdminPermissions';
import { AdminPermissions } from '../types';
import { Card, CardContent } from '../../../shared/ui/Card';
import { AlertTriangle, Lock } from 'lucide-react';

interface PermissionGuardProps {
    children: ReactNode;
    permission?: keyof AdminPermissions;
    permissions?: (keyof AdminPermissions)[];
    requireAll?: boolean; // true면 모든 권한 필요, false면 하나라도 있으면 됨
    fallback?: ReactNode;
    showAccessDenied?: boolean;
}

export function PermissionGuard({
    children,
    permission,
    permissions = [],
    requireAll = false,
    fallback,
    showAccessDenied = true
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAdminPermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions.length > 0) {
        hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    } else {
        // 권한이 지정되지 않으면 항상 허용
        hasAccess = true;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (!showAccessDenied) {
        return null;
    }

    return (
        <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-yellow-800">접근 권한이 없습니다</h3>
                        <p className="text-sm text-yellow-700">
                            이 기능에 접근하려면 적절한 권한이 필요합니다. 관리자에게 문의하세요.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
