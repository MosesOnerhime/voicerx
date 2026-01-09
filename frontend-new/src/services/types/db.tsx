// Enums matching your DB Schema
export type Gender = 'Male' | 'Female' | 'Other';
export type ApptStatus = 
  | 'Created' 
  | 'Vitals_Recorded' 
  | 'Assigned' 
  | 'In_Queue' 
  | 'In_Consultation' 
  | 'Pending_Pharmacy' 
  | 'Pending_Referral' 
  | 'Completed' 
  | 'Cancelled';

export type Priority = 'normal' | 'urgent' | 'emergency';
export type PatientStatus = 'Active' | 'Inactive';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone_number: string;
  patient_id_number: string;
  registered_at: string;
  status: PatientStatus;
}

// The Appointment usually comes with the Patient data "joined" (populated)
export interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  patient?: Patient; // Backend should populate this!
  status: ApptStatus;
  priority: Priority;
  created_at: string;
  assigned_doctor_id?: string;
}