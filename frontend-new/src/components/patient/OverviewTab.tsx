import type { PatientApptRecord } from '../../services/types/db'; // Up to src, then types
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout-containers'; 
import { User, Activity, FileText, Stethoscope } from 'lucide-react';
import { calculateAge } from '../../lib/dateUtils';

interface OverviewTabProps {
  record: PatientApptRecord;
}

export function OverviewTab({ record }: OverviewTabProps) {
  const { patient, intakeNotes, diagnosisTreatment, visitDate } = record as any;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Demographics */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-healthcare-purple" />
            Demographics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Full Name</span>
            <span className="text-sm font-medium">{patient.firstName} {patient.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Age</span>
            <span className="text-sm font-medium">{calculateAge(patient.dateOfBirth)} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Gender</span>
            <span className="text-sm font-medium">{patient.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Patient ID</span>
            <span className="text-sm font-medium font-mono">{patient.patientIdNumber || patient.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Visit Date</span>
            <span className="text-sm font-medium">{visitDate || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Vitals Summary */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-healthcare-purple" />
            Current Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Blood Pressure</span>
            <span className="text-sm font-medium">{intakeNotes?.vitals?.bloodPressure || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Temperature</span>
            <span className="text-sm font-medium">{intakeNotes?.vitals?.temperature || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Heart Rate</span>
            <span className="text-sm font-medium">{intakeNotes?.vitals?.heartRate || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Respiratory Rate</span>
            <span className="text-sm font-medium">{intakeNotes?.vitals?.respiratoryRate || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">O2 Saturation</span>
            <span className="text-sm font-medium">{intakeNotes?.vitals?.oxygenSaturation || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaints */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-healthcare-purple" />
            Chief Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {intakeNotes?.symptoms?.length > 0 ? (
              intakeNotes.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-healthcare-purple flex-shrink-0" />
                  {symptom}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground italic">No symptoms recorded</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Current Assessment */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-healthcare-purple" />
            Current Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {diagnosisTreatment.diagnosis ? (
            <>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Diagnosis</span>
                <p className="mt-1 text-sm">{diagnosisTreatment.diagnosis}</p>
              </div>
              {diagnosisTreatment.prescriptions.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Prescriptions</span>
                  <ul className="mt-1 space-y-1">
                    {diagnosisTreatment.prescriptions.map((rx, index) => (
                      <li key={index} className="text-sm">{rx}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Diagnosis pending - please review intake notes and complete assessment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
