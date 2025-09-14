import { ReactNode } from 'react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    onBack?: () => void;
    className?: string;
}

export function AdminLayout({
    children,
    title,
    subtitle,
    onBack,
    className = ""
}: AdminLayoutProps) {
    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    {onBack && (
                        <Button variant="ghost" onClick={onBack} className="p-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-gray-600">{subtitle}</p>}
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}
