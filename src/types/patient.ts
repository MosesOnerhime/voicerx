export type RecordStatus = 'pending' | 'updated' | 'approved';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastUpdated: string;
  status: RecordStatus;
  visitDate: string;
  assignedDoctor: string;
}

export interface Vitals {
  bloodPressure: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
}

export interface IntakeNotes {
  symptoms: string[];
  vitals: Vitals;
  nurseNotes: string;
  transcriptionNotes: string;
  enteredBy: string;
  enteredAt: string;
}

export interface DiagnosisTreatment {
  diagnosis: string;
  treatmentPlan: string;
  prescriptions: string[];
  doctorNotes: string;
}

export interface PatientRecord {
  patient: Patient;
  intakeNotes: IntakeNotes;
  diagnosisTreatment: DiagnosisTreatment;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  date: string;
  action: string;
  performedBy: string;
  role: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'intake' | 'update' | 'approval';
}
