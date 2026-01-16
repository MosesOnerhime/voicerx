import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export interface ConsultationNotesPayload {
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptions?: string[];
  doctorNotes?: string;
}

export interface DoctorAvailabilityResponse {
  isAvailable: boolean;
  currentPatients: number;
  message: string;
}

export const doctorApi = {
  // GET - Get doctor's queue (patients assigned to this doctor)
  getQueue: async (token: string) => {
    const response = await axios.get(`${API_URL}/appointments/queue`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // GET - Get current doctor's availability status
  getAvailability: async (token: string): Promise<DoctorAvailabilityResponse> => {
    const response = await axios.get(`${API_URL}/doctors/me/availability`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // PUT - Toggle doctor's availability status
  setAvailability: async (isAvailable: boolean, token: string): Promise<DoctorAvailabilityResponse> => {
    const response = await axios.put(
      `${API_URL}/doctors/me/availability`,
      { isAvailable },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // GET - Get appointment by ID with full details
  getAppointmentById: async (appointmentId: string, token: string) => {
    const response = await axios.get(`${API_URL}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.appointment;
  },

  // POST - Start consultation (change status to IN_CONSULTATION)
  startConsultation: async (appointmentId: string, token: string) => {
    const response = await axios.post(
      `${API_URL}/appointments/consultation`,
      { appointmentId, action: 'start' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // POST - Complete consultation (change status to COMPLETED or PENDING_PHARMACY)
  completeConsultation: async (appointmentId: string, token: string) => {
    const response = await axios.post(
      `${API_URL}/appointments/consultation`,
      { appointmentId, action: 'complete' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // PUT - Save consultation notes (diagnosis, treatment, prescriptions)
  saveConsultationNotes: async (
    appointmentId: string,
    notes: ConsultationNotesPayload,
    token: string
  ) => {
    const response = await axios.put(
      `${API_URL}/appointments/consultation`,
      { appointmentId, ...notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};
