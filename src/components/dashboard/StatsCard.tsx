import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'mt-1 text-xs font-medium',
              trend.positive ? 'text-status-approved' : 'text-status-updated'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-healthcare-purple-light p-2.5">
          <Icon className="h-5 w-5 text-healthcare-purple" />
        </div>
      </div>
    </div>
  );
}
