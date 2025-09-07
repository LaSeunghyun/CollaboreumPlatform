import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    iconColor = "text-indigo"
}) => {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className={`text-2xl md:text-3xl font-bold tabular-nums ${iconColor}`}>
                {value}
            </span>
        </div>
    );
};
