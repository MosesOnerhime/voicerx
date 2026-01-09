import { Clock, AlertCircle, User, Stethoscope } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { type ApptStatus, type Priority } from "../services/types/db";

interface PatientCardProps {
  id: string;
  name: string;
  status: ApptStatus;
  waitingTime: string;
  priority?: Priority;
  assignedDoctor?: string;
  onRecordVitals?: () => void;
  onStartIntake?: () => void;
  onAssignDoctor?: () => void;
  onUpdateVitals?: () => void;
  onClick?: () => void;
}

const priorityConfig = {
  NORMAL: { label: "Normal", className: "bg-muted text-muted-foreground" },
  URGENT: { label: "Urgent", className: "bg-warning/10 text-warning border-warning/20" },
  EMERGENCY: { label: "Emergency", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const statusConfig: Record<ApptStatus, { label: string; className: string }> = {
  CREATED: { label: "Created", className: "bg-status-created/10 text-status-created border-status-created/20" },
  VITALS_RECORDED: { label: "Vitals Recorded", className: "bg-status-vitals/10 text-status-vitals border-status-vitals/20" },
  ASSIGNED: { label: "Assigned", className: "bg-status-assigned/10 text-status-assigned border-status-assigned/20" },
  IN_QUEUE: { label: "In Queue", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  IN_CONSULTATION: { label: "In Consultation", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  PENDING_PHARMACY: { label: "Pharmacy", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  PENDING_REFERRAL: { label: "Referral", className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  COMPLETED: { label: "Completed", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

export function PatientCard({
  id,
  name,
  status,
  waitingTime,
  priority = "NORMAL",
  assignedDoctor,
  onRecordVitals,
  onStartIntake,
  onAssignDoctor,
  onUpdateVitals,
  onClick,
}: PatientCardProps) {
  const priorityInfo = priorityConfig[priority];
  const statusInfo = statusConfig[status];

  return (
    <div
      className={cn(
        "group bg-card rounded-xl border border-border p-5 transition-all duration-200",
        "hover:shadow-card-hover hover:border-primary/20 cursor-pointer",
        priority === "URGENT" && "border-l-4 border-l-destructive"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Patient Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <span className="text-sm text-muted-foreground">#{id}</span>
            </div>
            
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
              
              {priority !== "NORMAL" && (
                <Badge variant="outline" className={cn(priorityInfo.className, "gap-1")}>
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  <span>{priorityInfo.label} Priority</span>
                </Badge>
              )}

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>Waiting: {waitingTime}</span>
              </div>

              {status === "ASSIGNED" && assignedDoctor && (
                <div className="flex items-center gap-1.5 text-sm text-primary">
                  <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  <span>Dr. {assignedDoctor}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {status === "CREATED" && (
            <>
              <Button variant="outline" size="sm" onClick={onStartIntake}>
                Start Intake
              </Button>
              <Button size="sm" onClick={onRecordVitals}>
                Record Vitals
              </Button>
            </>
          )}

          {status === "VITALS_RECORDED" && (
            <>
              <Button variant="outline" size="sm" onClick={onUpdateVitals}>
                Update Vitals
              </Button>
              <Button size="sm" onClick={onAssignDoctor}>
                Assign Doctor
              </Button>
            </>
          )}

          {status === "ASSIGNED" && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Awaiting Consultation
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
