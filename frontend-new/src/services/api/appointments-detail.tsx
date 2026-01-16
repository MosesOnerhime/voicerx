import axios from 'axios';
import type { Appointment } from '../types/db';

const API_URL = 'http://localhost:5001/api';

export const appointmentDetailApi = {
  // GET - Get complete appointment details with all related data
  getById: async (appointmentId: string, token: string) => {
    const response = await axios.get<{
      appointment: Appointment & {
        patient: any;
        waitTimes: {
          totalMinutes: number;
          doctorAssignedWaitMinutes: number;
          consultationDurationMinutes: number;
        };
      };
    }>(`${API_URL}/appointments/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.appointment;
  },

  // PUT - Update appointment (priority, chief complaint, cancel)
  update: async (
    appointmentId: string,
    payload: {
      priority?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
      chiefComplaint?: string;
      status?: 'CANCELLED';
    },
    token: string
  ) => {
    const response = await axios.put(
      `${API_URL}/appointments/${appointmentId}`,
      payload,
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