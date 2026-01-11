import type  { ActivityItem } from '../../services/types/db'; // Go up twice (out of dashboard, out of components)
import { FileText, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from "../../lib/utils";

interface ActivityPanelProps {
  activities: ActivityItem[];
}

const activityIcons = {
  intake: FileText,
  update: RefreshCw,
  approval: CheckCircle,
};

const activityColors = {
  intake: 'bg-healthcare-purple-light text-healthcare-purple',
  update: 'bg-status-updated-bg text-status-updated',
  approval: 'bg-status-approved-bg text-status-approved',
};

export function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <div className={cn(
                'mt-0.5 rounded-lg p-2',
                activityColors[activity.type]
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
