import type { Patient } from '../services/types/db';

// 1. Mock Patients (The permanent records)
export const MOCK_PATIENTS: Patient[] = [
  {
    id: "pat-001",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-05-12",
    gender: "MALE",
    phoneNumber: "+234-801-234-5678",
    patientIdNumber: "HOSP-10023",
    registeredAt: "2023-10-01",
    status: "ACTIVE",
    bloodType: "O+",
  },
  {
    id: "pat-002",
    firstName: "Sarah",
    lastName: "Ames",
    dateOfBirth: "1992-11-24",
    gender: "FEMALE",
    phoneNumber: "+234-703-987-6543",
    patientIdNumber: "HOSP-10024",
    registeredAt: "2023-11-15",
    status: "ACTIVE",
    bloodType: "A-",
  }
];

// 2. Mock PatientAppt (The "Joined" view for Dashboards)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_DASHBOARD_DATA: any[] = [
  {
    appointmentId: "1234",
    patient: MOCK_PATIENTS[0],
    lastUpdated: new Date().toISOString(),
    status: "pending" as any, // Matching your ApptStatus
    visitDate: "2026-01-11",
    assignedDoctor: "Dr. Onerhime",
  intakeNotes: {
    vitals: {
      bloodPressure: "120/80",
      temperature: "36.5",
      heartRate: "72",
      respiratoryRate: "16",
      oxygenSaturation: "98"
    },
    symptoms: ["Headache", "Fever"],
    nurseNotes: "Patient arrived complaining of mild migraine.",
    transcriptionNotes: "...",
    enteredBy: "Nurse Joy",
    enteredAt: new Date().toISOString()
  },
  diagnosisTreatment: {
    diagnosis: "Common Cold",
    treatmentPlan: "Rest and hydration",
    prescriptions: ["Paracetamol"],
    doctorNotes: "Monitor for 24 hours"
  },
  history: []
  },
  {
    appointmentId: "1244",
    patient: MOCK_PATIENTS[1],
    lastUpdated: new Date().toISOString(),
    status: "approved" as any,
    visitDate: "2026-01-11",
    assignedDoctor: "Dr. Kosiso",
    intakeNotes: {
    vitals: {
      bloodPressure: "120/80",
      temperature: "36.5",
      heartRate: "72",
      respiratoryRate: "16",
      oxygenSaturation: "98"
    },
    symptoms: ["Headache", "Fever"],
    nurseNotes: "Patient arrived complaining of mild migraine.",
    transcriptionNotes: "...",
    enteredBy: "Nurse Joy",
    enteredAt: new Date().toISOString()
  },
  diagnosisTreatment: {
    diagnosis: "Common Cold",
    treatmentPlan: "Rest and hydration",
    prescriptions: ["Paracetamol"],
    doctorNotes: "Monitor for 24 hours"
  },
  history: []
  }
];