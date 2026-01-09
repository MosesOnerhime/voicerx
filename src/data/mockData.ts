import { Patient, PatientRecord, ActivityItem } from '../types/patient';

export const mockPatients: Patient[] = [
  {
    id: 'PT-2024-001',
    name: 'Sarah Johnson',
    age: 45,
    gender: 'Female',
    lastUpdated: '2024-01-08 09:30 AM',
    status: 'pending',
    visitDate: '2024-01-08',
    assignedDoctor: 'Dr. Michael Chen',
  },
  {
    id: 'PT-2024-002',
    name: 'Robert Williams',
    age: 62,
    gender: 'Male',
    lastUpdated: '2024-01-08 08:15 AM',
    status: 'updated',
    visitDate: '2024-01-08',
    assignedDoctor: 'Dr. Michael Chen',
  },
  {
    id: 'PT-2024-003',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    lastUpdated: '2024-01-07 04:45 PM',
    status: 'approved',
    visitDate: '2024-01-07',
    assignedDoctor: 'Dr. Michael Chen',
  },
  {
    id: 'PT-2024-004',
    name: 'James Miller',
    age: 55,
    gender: 'Male',
    lastUpdated: '2024-01-08 10:00 AM',
    status: 'pending',
    visitDate: '2024-01-08',
    assignedDoctor: 'Dr. Michael Chen',
  },
  {
    id: 'PT-2024-005',
    name: 'Maria Garcia',
    age: 38,
    gender: 'Female',
    lastUpdated: '2024-01-08 07:30 AM',
    status: 'updated',
    visitDate: '2024-01-08',
    assignedDoctor: 'Dr. Michael Chen',
  },
];

export const mockPatientRecords: Record<string, PatientRecord> = {
  'PT-2024-001': {
    patient: mockPatients[0],
    intakeNotes: {
      symptoms: ['Persistent headache for 3 days', 'Mild nausea', 'Sensitivity to light'],
      vitals: {
        bloodPressure: '128/82 mmHg',
        temperature: '98.6°F',
        heartRate: '76 bpm',
        respiratoryRate: '16/min',
        oxygenSaturation: '98%',
      },
      nurseNotes: 'Patient reports headache started after prolonged screen time at work. No history of migraines. Has been taking OTC pain relievers with minimal relief.',
      transcriptionNotes: 'Patient describes pain as throbbing, primarily on the right side. Pain level rated 6/10. No visual disturbances reported.',
      enteredBy: 'Nurse Amanda Peters',
      enteredAt: '2024-01-08 09:15 AM',
    },
    diagnosisTreatment: {
      diagnosis: '',
      treatmentPlan: '',
      prescriptions: [],
      doctorNotes: '',
    },
    history: [
      { date: '2024-01-08 09:30 AM', action: 'Patient intake completed', performedBy: 'Amanda Peters', role: 'Nurse' },
      { date: '2024-01-08 09:00 AM', action: 'Patient checked in', performedBy: 'Front Desk', role: 'Staff' },
    ],
  },
  'PT-2024-002': {
    patient: mockPatients[1],
    intakeNotes: {
      symptoms: ['Shortness of breath', 'Chest discomfort', 'Fatigue'],
      vitals: {
        bloodPressure: '145/95 mmHg',
        temperature: '98.2°F',
        heartRate: '88 bpm',
        respiratoryRate: '20/min',
        oxygenSaturation: '96%',
      },
      nurseNotes: 'Patient has history of hypertension. Currently on Lisinopril 10mg daily. Reports symptoms worsening over past week.',
      transcriptionNotes: 'Patient notes difficulty climbing stairs without getting winded. Sleeping with two pillows. No leg swelling observed.',
      enteredBy: 'Nurse David Kim',
      enteredAt: '2024-01-08 08:00 AM',
    },
    diagnosisTreatment: {
      diagnosis: 'Suspected early heart failure - requires further evaluation',
      treatmentPlan: 'Order echocardiogram and BNP levels. Increase Lisinopril to 20mg. Follow up in 1 week.',
      prescriptions: ['Lisinopril 20mg - 1 tablet daily', 'Furosemide 20mg - 1 tablet daily as needed for swelling'],
      doctorNotes: 'Patient counseled on low-sodium diet. Will review echo results and adjust treatment as needed.',
    },
    history: [
      { date: '2024-01-08 08:15 AM', action: 'Diagnosis and treatment updated', performedBy: 'Dr. Michael Chen', role: 'Physician' },
      { date: '2024-01-08 08:00 AM', action: 'Patient intake completed', performedBy: 'David Kim', role: 'Nurse' },
      { date: '2024-01-08 07:45 AM', action: 'Patient checked in', performedBy: 'Front Desk', role: 'Staff' },
    ],
  },
  'PT-2024-003': {
    patient: mockPatients[2],
    intakeNotes: {
      symptoms: ['Sore throat', 'Mild fever', 'Body aches'],
      vitals: {
        bloodPressure: '118/75 mmHg',
        temperature: '100.4°F',
        heartRate: '82 bpm',
        respiratoryRate: '18/min',
        oxygenSaturation: '99%',
      },
      nurseNotes: 'Symptoms started 2 days ago. Rapid strep test performed - positive result.',
      transcriptionNotes: 'Patient reports difficulty swallowing. No rash. No known drug allergies.',
      enteredBy: 'Nurse Amanda Peters',
      enteredAt: '2024-01-07 04:30 PM',
    },
    diagnosisTreatment: {
      diagnosis: 'Streptococcal pharyngitis (Strep throat)',
      treatmentPlan: 'Antibiotic therapy for 10 days. Rest and increased fluid intake. Return if symptoms worsen.',
      prescriptions: ['Amoxicillin 500mg - 1 capsule three times daily for 10 days', 'Ibuprofen 400mg - as needed for pain/fever'],
      doctorNotes: 'Discussed importance of completing full antibiotic course. Patient understands to return if difficulty breathing or worsening symptoms.',
    },
    history: [
      { date: '2024-01-07 04:45 PM', action: 'Medical record approved', performedBy: 'Dr. Michael Chen', role: 'Physician' },
      { date: '2024-01-07 04:40 PM', action: 'Diagnosis and treatment completed', performedBy: 'Dr. Michael Chen', role: 'Physician' },
      { date: '2024-01-07 04:30 PM', action: 'Patient intake completed', performedBy: 'Amanda Peters', role: 'Nurse' },
    ],
  },
};

export const mockActivities: ActivityItem[] = [
  { id: '1', message: 'Patient intake updated by Nurse Amanda Peters', timestamp: '10 minutes ago', type: 'intake' },
  { id: '2', message: 'Robert Williams record updated - awaiting approval', timestamp: '25 minutes ago', type: 'update' },
  { id: '3', message: 'Emily Davis record approved successfully', timestamp: '1 hour ago', type: 'approval' },
  { id: '4', message: 'New patient James Miller assigned to you', timestamp: '2 hours ago', type: 'intake' },
  { id: '5', message: 'Maria Garcia vitals updated by Nurse David Kim', timestamp: '3 hours ago', type: 'update' },
];
