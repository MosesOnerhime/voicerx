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
  id: number;
  medication_name: string;
  dosage: string;
  quantity: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  appointmentid: number;
  patient_name: string;
  patient_id: string;
  prescribed_by: string;
  assigned_pharmacist_id: string;
  priority: Priority;
  status: Status;
  date_issued: string;
  date_dispensed: string | null;
  pharmacist_notes: string | null;
  notes?: string;
  medications?: Medication[];
}


