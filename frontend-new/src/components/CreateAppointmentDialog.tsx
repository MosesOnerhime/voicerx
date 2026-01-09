import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { type Patient } from "../services/types/db";
import { v4 as uuidv4 } from 'uuid'; // You may need to install 'uuid' package

interface CreateAppointmentProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateAppointmentDialog({ patient, open, onOpenChange, onSubmit }: CreateAppointmentProps) {
  const [complaint, setComplaint] = useState("");
  const [priority, setPriority] = useState("Normal");

  const handleSave = () => {
    if (!patient) return;

    const appointmentPayload = {
      type: "new_appointment",
      appointment_id: uuidv4(), // Client-side generated UUID
      patient_name: `${patient.first_name} ${patient.last_name}`,
      priority: priority,
      chief_complaint: complaint, // Additional field for the UI
      status: "Created"
    };

    onSubmit(appointmentPayload);
    onOpenChange(false);
    // Reset form
    setComplaint("");
    setPriority("Normal");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Scheduling for: <span className="font-medium text-foreground">{patient?.first_name} {patient?.last_name}</span>
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="complaint">Chief Complaint</Label>
            <Textarea 
              id="complaint" 
              placeholder="e.g. Persistent cough, high fever..." 
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!complaint}>Create Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}