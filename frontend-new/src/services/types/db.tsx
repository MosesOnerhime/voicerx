// Enums matching your DB Schema (UPPERCASE to match backend)
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ApptStatus =
  | 'CREATED'
  | 'VITALS_RECORDED'
  | 'ASSIGNED'
  | 'IN_QUEUE'
  | 'IN_CONSULTATION'
  | 'PENDING_PHARMACY'
  | 'PENDING_REFERRAL'
  | 'COMPLETED'
  | 'CANCELLED';

export type Priority = 'NORMAL' | 'URGENT' | 'EMERGENCY';
export type PatientStatus = 'ACTIVE' | 'INACTIVE';

// camelCase to match backend response
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  patientIdNumber: string;
  registeredAt: string;
  status: PatientStatus;
  bloodType?: string;
  email?: string;
}

// The Appointment usually comes with the Patient data "joined" (populated)
export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patient?: Patient; // Backend should populate this!
  status: ApptStatus;
  priority: Priority;
  createdAt: string;
  assignedDoctorId?: string;
  chiefComplaint?: string;
}

export type Status = "pending" | "dispensed";

export interface Medication {
  id: string;
  medicationName: string;
  dosage: string;
  quantity: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId: number;
  patientName: string;
  patient_id: string;
  prescribedBy: string;
  assignedPharmacistId: string;
  priority: Priority;
  status: Status;
  dateIssued: string;
  dateDispensed: string | null;
  pharmacistNotes: string | null;
  notes?: string;
  medications?: Medication[];
}

export type RecordStatus = 'pending' | 'updated' | 'approved';

export interface PatientAppt {
  appointmentId: string;
  patient: Patient;
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

