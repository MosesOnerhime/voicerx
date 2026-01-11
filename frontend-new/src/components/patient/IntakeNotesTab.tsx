import type { IntakeNotes } from '../../services/types/db'; // Up two levels to src, then types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout-containers'; // Up one level to components, then ui
import { Alert, AlertDescription } from '../ui/overlays-and-feedback'; // Up one level to components, then ui
import { Activity, FileText, Mic, User, Info } from 'lucide-react';

interface IntakeNotesTabProps {
  intakeNotes: IntakeNotes;
}

export function IntakeNotesTab({ intakeNotes }: IntakeNotesTabProps) {
  return (
    <div className="space-y-6">
      {/* Read-only notice */}
      <Alert className="border-healthcare-purple/20 bg-healthcare-purple-light">
        <Info className="h-4 w-4 text-healthcare-purple" />
        <AlertDescription className="text-sm text-healthcare-purple">
          This is a read-only view of intake data entered by nursing staff. Data cannot be modified from this screen.
        </AlertDescription>
      </Alert>

      {/* Entry Info */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <User className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Entered by {intakeNotes.enteredBy}</p>
          <p className="text-xs text-muted-foreground">{intakeNotes.enteredAt}</p>
        </div>
        <span className="rounded-full bg-healthcare-teal-light px-2.5 py-0.5 text-xs font-medium text-healthcare-teal">
          Nurse / Medical Assistant
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Symptoms */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-healthcare-purple" />
            Symptoms
          </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intakeNotes.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                  {symptom}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-healthcare-purple" />
            Vital Signs
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="mt-1 text-lg font-semibold">{intakeNotes.vitals.bloodPressure}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="mt-1 text-lg font-semibold">{intakeNotes.vitals.temperature}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="mt-1 text-lg font-semibold">{intakeNotes.vitals.heartRate}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Respiratory Rate</p>
                <p className="mt-1 text-lg font-semibold">{intakeNotes.vitals.respiratoryRate}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Oxygen Saturation</p>
                <p className="mt-1 text-lg font-semibold">{intakeNotes.vitals.oxygenSaturation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nurse Notes */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-healthcare-purple" />
            Nurse Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-foreground">{intakeNotes.nurseNotes}</p>
          </div>
        </CardContent>
      </Card>

      {/* Transcription Notes */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4 text-healthcare-purple" />
            Auto-Generated Transcription Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
            <p className="text-sm leading-relaxed text-foreground">{intakeNotes.transcriptionNotes}</p>
            <p className="mt-3 text-xs text-muted-foreground italic">
              * This content was auto-generated from voice recording during patient intake.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
