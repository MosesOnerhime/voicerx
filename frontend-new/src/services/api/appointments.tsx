// services/api/appointments.ts
import axios from 'axios';
import { type Appointment } from '../types/db';

const API_URL = 'http://localhost:5001/api'; // Use full URL

export const appointmentApi = {
  getNurseQueue: async (token: string) => {
    const response = await axios.get(`${API_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const appointments = response.data.appointments || [];
    const hiddenStatuses = ['COMPLETED', 'CANCELLED'];

    return appointments.filter((apt: Appointment) =>
      !hiddenStatuses.includes(apt.status)
    );
  },
  
  create: async (payload: any, token: string) => {
    const response = await axios.post(`${API_URL}/appointments`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  }
};