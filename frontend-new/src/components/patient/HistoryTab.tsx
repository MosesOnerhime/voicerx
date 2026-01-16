import type { HistoryEntry } from '../../services/types/db'; // Up two levels to src, then into types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout-containers'; // Up one level to components, then into ui
import { Clock, User } from 'lucide-react';

interface HistoryTabProps {
  history: HistoryEntry[];
}

export function HistoryTab({ history }: HistoryTabProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-healthcare-purple" />
            Record History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic text-center py-8">
            No history available for this visit yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-healthcare-purple" />
          Record History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {history.map((entry, index) => (
              <div key={index} className="relative flex gap-4 pl-8">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-healthcare-purple bg-card" />

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{entry.action}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.performedBy}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {entry.role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
