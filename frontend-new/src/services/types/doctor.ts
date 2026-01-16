import type { Patient, ApptStatus, Priority, Vitals, IntakeNotes, DiagnosisTreatment, RecordStatus } from './db';

// Vitals record structure from API
interface VitalsRecord {
  id: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  temperature: number | null;
  pulseRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weight?: number | null;
  height?: number | null;
  painLevel?: number | null;
  symptomsDescription?: string | null;
  nurseNotes?: string | null;
  recordedAt: string;
  recordedByUser?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Voice transcript structure from API
interface VoiceTranscript {
  id: string;
  rawTranscript?: string | null;
  processedNotes?: string | null;
  audioUrl?: string | null;
  createdAt: string;
}

// Consultation notes structure from API
interface ConsultationNote {
  id?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
  diagnosisCodes?: string[];
  additionalNotes?: string;
}

// API response types for doctor queue
export interface DoctorQueueItem {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patient: Patient;
  status: ApptStatus;
  priority: Priority;
  createdAt: string;
  assignedDoctorId?: string;
  chiefComplaint?: string;
  // Backend returns either vitals or vitalsRecord depending on endpoint
  vitals?: VitalsRecord;
  vitalsRecord?: VitalsRecord;
  // Backend returns either consultationNotes or consultationNote
  consultationNotes?: {
    diagnosis?: string;
    treatmentPlan?: string;
    prescriptions?: string[];
    doctorNotes?: string;
  };
  consultationNote?: ConsultationNote;
  voiceTranscript?: VoiceTranscript;
  waitTimes?: {
    totalMinutes: number;
    doctorAssignedWaitMinutes: number;
    consultationDurationMinutes: number;
  };
  // Timestamps for history
  consultationStartedAt?: string;
  consultationCompletedAt?: string;
  completedAt?: string;
  assignedDoctor?: {
    firstName: string;
    lastName: string;
    specialization?: string;
  };
}

export interface DoctorQueueResponse {
  queue: DoctorQueueItem[];
  stats: {
    total: number;
    emergency: number;
    urgent: number;
    normal: number;
  };
}

// Formatted vitals record for UI display
export interface FormattedVitals {
  bloodPressure: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight?: string;
  height?: string;
}

// Map API status to UI-friendly status
export function mapApiStatusToUI(apiStatus: ApptStatus): RecordStatus {
  switch (apiStatus) {
    case 'IN_QUEUE':
    case 'ASSIGNED':
      return 'pending';
    case 'IN_CONSULTATION':
      return 'updated';
    case 'COMPLETED':
    case 'PENDING_PHARMACY':
    case 'PENDING_REFERRAL':
      return 'approved';
    default:
      return 'pending';
  }
}

// Map UI status back to API status for filtering
export function mapUIStatusToApi(uiStatus: RecordStatus): ApptStatus[] {
  switch (uiStatus) {
    case 'pending':
      return ['IN_QUEUE', 'ASSIGNED'];
    case 'updated':
      return ['IN_CONSULTATION'];
    case 'approved':
      return ['COMPLETED', 'PENDING_PHARMACY', 'PENDING_REFERRAL'];
    default:
      return [];
  }
}

// Format API vitals to UI-friendly format
export function formatVitalsFromApi(vitals: DoctorQueueItem['vitals'] | DoctorQueueItem['vitalsRecord']): FormattedVitals | null {
  if (!vitals) return null;

  // Handle null values gracefully
  const systolic = vitals.bloodPressureSystolic;
  const diastolic = vitals.bloodPressureDiastolic;
  const hasBP = systolic !== null && systolic !== undefined && diastolic !== null && diastolic !== undefined;

  return {
    bloodPressure: hasBP ? `${systolic}/${diastolic}` : 'N/A',
    temperature: vitals.temperature ? `${vitals.temperature}°C` : 'N/A',
    heartRate: vitals.pulseRate ? `${vitals.pulseRate} bpm` : 'N/A',
    respiratoryRate: vitals.respiratoryRate ? `${vitals.respiratoryRate}/min` : 'N/A',
    oxygenSaturation: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A',
    weight: vitals.weight ? `${vitals.weight} kg` : undefined,
    height: vitals.height ? `${vitals.height} cm` : undefined,
  };
}

// Build history entries from appointment data
function buildHistoryFromAppointment(item: DoctorQueueItem, vitalsData: any) {
  const history: Array<{
    date: string;
    action: string;
    performedBy: string;
    role: string;
  }> = [];

  // Appointment created
  if (item.createdAt) {
    history.push({
      date: new Date(item.createdAt).toLocaleString(),
      action: 'Appointment created',
      performedBy: 'System',
      role: 'System',
    });
  }

  // Vitals recorded
  if (vitalsData?.recordedAt) {
    const nurseName = vitalsData.recordedByUser
      ? `${vitalsData.recordedByUser.firstName} ${vitalsData.recordedByUser.lastName}`
      : 'Nurse';
    history.push({
      date: new Date(vitalsData.recordedAt).toLocaleString(),
      action: 'Vitals recorded',
      performedBy: nurseName,
      role: 'Nurse',
    });
  }

  // Doctor assigned
  if (item.assignedDoctorId && (item as any).assignedDoctor) {
    const doctor = (item as any).assignedDoctor;
    history.push({
      date: new Date(item.createdAt).toLocaleString(), // Approximate
      action: 'Assigned to doctor',
      performedBy: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      role: 'Doctor',
    });
  }

  // Consultation started
  if ((item as any).consultationStartedAt) {
    history.push({
      date: new Date((item as any).consultationStartedAt).toLocaleString(),
      action: 'Consultation started',
      performedBy: 'Doctor',
      role: 'Doctor',
    });
  }

  // Consultation completed
  if ((item as any).consultationCompletedAt) {
    history.push({
      date: new Date((item as any).consultationCompletedAt).toLocaleString(),
      action: 'Consultation completed',
      performedBy: 'Doctor',
      role: 'Doctor',
    });
  }

  // Sort by date (oldest first)
  return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Transform API queue item to PatientAppt format for compatibility with existing UI components
export function transformQueueItemToPatientAppt(item: DoctorQueueItem) {
  // Handle both vitals and vitalsRecord field names (different endpoints use different names)
  const vitalsData = item.vitals || item.vitalsRecord;
  const formattedVitals = formatVitalsFromApi(vitalsData);

  // Handle both consultationNotes and consultationNote field names
  const consultNotes = item.consultationNotes || item.consultationNote;

  // Get symptoms from either chiefComplaint or vitalsRecord.symptomsDescription
  const symptoms: string[] = [];
  if (item.chiefComplaint) {
    symptoms.push(item.chiefComplaint);
  }
  if (vitalsData?.symptomsDescription) {
    symptoms.push(vitalsData.symptomsDescription);
  }

  // Get nurse name from vitalsRecord.recordedByUser
  const recordedByUser = vitalsData?.recordedByUser;
  const enteredBy = recordedByUser
    ? `${recordedByUser.firstName} ${recordedByUser.lastName}`
    : 'Nurse';

  // Get transcription notes from voiceTranscript
  const transcriptNotes = item.voiceTranscript?.rawTranscript ||
    item.voiceTranscript?.processedNotes || '';

  // Get nurse notes from vitalsRecord - use symptomsDescription as the primary notes field
  const nurseNotes = vitalsData?.symptomsDescription || '';

  // Format the recorded time
  const enteredAt = vitalsData?.recordedAt
    ? new Date(vitalsData.recordedAt).toLocaleString()
    : new Date(item.createdAt).toLocaleString();

  return {
    appointmentId: item.id,
    patient: item.patient,
    lastUpdated: item.createdAt,
    status: mapApiStatusToUI(item.status),
    visitDate: new Date(item.createdAt).toLocaleDateString(),
    assignedDoctor: item.assignedDoctorId || 'Unassigned',
    intakeNotes: {
      vitals: formattedVitals ? {
        bloodPressure: formattedVitals.bloodPressure,
        temperature: formattedVitals.temperature,
        heartRate: formattedVitals.heartRate,
        respiratoryRate: formattedVitals.respiratoryRate,
        oxygenSaturation: formattedVitals.oxygenSaturation,
      } : {
        bloodPressure: 'N/A',
        temperature: 'N/A',
        heartRate: 'N/A',
        respiratoryRate: 'N/A',
        oxygenSaturation: 'N/A',
      },
      symptoms: symptoms.length > 0 ? symptoms : ['No symptoms recorded'],
      nurseNotes: nurseNotes,
      transcriptionNotes: transcriptNotes,
      enteredBy: enteredBy,
      enteredAt: enteredAt,
    },
    diagnosisTreatment: {
      diagnosis: (consultNotes as any)?.diagnosis || (consultNotes as any)?.assessment || '',
      treatmentPlan: (consultNotes as any)?.treatmentPlan || (consultNotes as any)?.plan || '',
      prescriptions: (consultNotes as any)?.prescriptions || [],
      doctorNotes: (consultNotes as any)?.doctorNotes || (consultNotes as any)?.additionalNotes || '',
    },
    history: buildHistoryFromAppointment(item, vitalsData),
    // Keep original API data for reference
    _apiData: item,
  };
}
