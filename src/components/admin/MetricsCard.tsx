import { Card, CardContent } from "../ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  trend 
}: MetricsCardProps) {
  const variantClasses = {
    default: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    danger: "bg-red-100 text-red-600"
  };

  const textColors = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${textColors[variant]}`}>
              {value}
            </p>
            {trend && (
              <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${variantClasses[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}