import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge"; // Ensure correct path
import { type ApptStatus, type Priority } from "../services/types/db";

// 1. Define UI mapping based on your DB types
const statusInfo: Record<ApptStatus, { description: string; className: string }> = {
  Created: { 
    description: "Initial registration, waiting for intake", 
    className: "bg-blue-100 text-blue-800 border-blue-200" 
  },
  Vitals_Recorded: { 
    description: "Vitals captured, ready for assignment", 
    className: "bg-purple-100 text-purple-800 border-purple-200" 
  },
  Assigned: { 
    description: "Doctor assigned to this patient", 
    className: "bg-indigo-100 text-indigo-800 border-indigo-200" 
  },
  In_Queue: { 
    description: "Patient is waiting in the doctor's queue", 
    className: "bg-orange-100 text-orange-800 border-orange-200" 
  },
  In_Consultation: { 
    description: "Patient is currently with the doctor", 
    className: "bg-yellow-100 text-yellow-800 border-yellow-200" 
  },
  Pending_Pharmacy: { 
    description: "Consultation done, awaiting medication", 
    className: "bg-cyan-100 text-cyan-800 border-cyan-200" 
  },
  Pending_Referral: { 
    description: "Awaiting specialist referral follow-up", 
    className: "bg-pink-100 text-pink-800 border-pink-200" 
  },
  Completed: { 
    description: "Process finished, patient discharged", 
    className: "bg-green-100 text-green-800 border-green-200" 
  },
  Cancelled: { 
    description: "Appointment cancelled", 
    className: "bg-gray-100 text-gray-800 border-gray-200" 
  },
};

const priorityInfo: Record<Priority, { description: string; className: string }> = {
  normal: { description: "Standard turnaround", className: "bg-gray-100 text-gray-800" },
  urgent: { description: "Prompt attention required", className: "bg-orange-100 text-orange-800 border-orange-200" },
  emergency: { description: "Life-threatening or critical", className: "bg-red-100 text-red-800 border-red-200 animate-pulse" },
};

export function StatusLegend() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50">
            <Info className="h-4 w-4" />
            <span>Status Guide</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="w-80 p-4 bg-white shadow-xl border border-border z-50">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-sm text-foreground mb-3">Pipeline Status</p>
              <div className="space-y-2">
                {(Object.entries(statusInfo) as [ApptStatus, typeof statusInfo['Created']][]).map(([status, info]) => (
                  <div key={status} className="flex items-start gap-3">
                    <Badge variant="outline" className={`${info.className} shrink-0 text-[10px] uppercase tracking-wider`}>
                      {status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground leading-relaxed">{info.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <p className="font-semibold text-sm text-foreground mb-3">Priority Levels</p>
              <div className="space-y-2">
                {(Object.entries(priorityInfo) as [Priority, typeof priorityInfo['normal']][]).map(([priority, info]) => (
                  <div key={priority} className="flex items-start gap-3">
                    <Badge variant="outline" className={`${info.className} shrink-0 text-[10px] uppercase`}>
                      {priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground leading-relaxed">{info.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}