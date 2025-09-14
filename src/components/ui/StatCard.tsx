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
        <div className="group">
            <div className="glass-morphism rounded-3xl p-6 lg:p-8 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-apple-lg hover:scale-105">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <div className={`text-2xl lg:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 ${iconColor}`}>
                    {value}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">
                    {label}
                </div>
            </div>
        </div>
    );
};
