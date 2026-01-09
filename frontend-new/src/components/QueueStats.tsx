import { Users, Clock, Activity, CheckCircle2 } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "primary" | "warning" | "success";
}

interface HelperText {
  totalPatients: string;
  awaitingVitals: string;
  awaitingDoctor: string;
  avgWaitTime: string;
}

const defaultHelperText: HelperText = {
  totalPatients: "All patients currently in queue",
  awaitingVitals: "Need vitals recorded before seeing doctor",
  awaitingDoctor: "Vitals complete, ready for consultation",
  avgWaitTime: "Average time from check-in to consultation",
};

function StatCard({ icon, label, value, subtext, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-card",
    primary: "bg-primary/5 border-primary/20",
    warning: "bg-warning/5 border-warning/20",
    success: "bg-success/5 border-success/20",
  };

  return (
    <div className={`rounded-xl border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1 leading-tight">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

interface QueueStatsProps {
  totalPatients: number;
  awaitingVitals: number;
  awaitingDoctor: number;
  avgWaitTime: string;
}

export function QueueStats({ totalPatients, awaitingVitals, awaitingDoctor, avgWaitTime }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="h-6 w-6" />}
        label="Total in Queue"
        value={totalPatients}
        subtext={defaultHelperText.totalPatients}
        variant="primary"
      />
      <StatCard
        icon={<Activity className="h-6 w-6" />}
        label="Awaiting Vitals"
        value={awaitingVitals}
        subtext={defaultHelperText.awaitingVitals}
      />
      <StatCard
        icon={<CheckCircle2 className="h-6 w-6" />}
        label="Ready for Doctor"
        value={awaitingDoctor}
        subtext={defaultHelperText.awaitingDoctor}
        variant="success"
      />
      <StatCard
        icon={<Clock className="h-6 w-6" />}
        label="Avg. Wait Time"
        value={avgWaitTime}
        subtext={defaultHelperText.avgWaitTime}
        variant="warning"
      />
    </div>
  );
}
