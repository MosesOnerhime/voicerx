import { useState } from "react";
import { Check, User, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: "available" | "busy";
  currentPatients?: number;
}

interface DoctorAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  appointmentId: string;
  patientId: string;
  doctors: Doctor[];
  onAssign: (doctorId: string) => void;
}

export function DoctorAssignmentDialog({
  open,
  onOpenChange,
  appointmentId,
  patientName,
  patientId,
  doctors,
  onAssign,
}: DoctorAssignmentDialogProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedDoctor) {
      onAssign(selectedDoctor);
      setSelectedDoctor(null);
      onOpenChange(false);
    }
  };

  const availableDoctors = doctors.filter((d) => d.availability === "available");
  const busyDoctors = doctors.filter((d) => d.availability === "busy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Doctor</DialogTitle>
          <DialogDescription>
            Select a doctor for <span className="font-medium text-foreground">{patientName}</span>{" "}
            <span className="text-muted-foreground">({patientId})</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {availableDoctors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Available Doctors
              </p>
              <div className="space-y-2">
                {availableDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      "hover:border-primary/50 hover:bg-accent/50",
                      selectedDoctor === doctor.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Available
                        </Badge>
                        {selectedDoctor === doctor.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {busyDoctors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Currently Busy
              </p>
              <div className="space-y-2 opacity-60">
                {busyDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="w-full p-3 rounded-lg border border-border bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Busy ({doctor.currentPatients} patients)
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doctors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No doctors available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedDoctor}>
            Assign Doctor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
