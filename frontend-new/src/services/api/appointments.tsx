import axios from 'axios';
import { type Appointment } from '../types/db';

const API_URL = 'http://localhost:3000/api';

export const appointmentApi = {
  getNurseQueue: async (token: string) => {
    // 1. Fetch all appointments
    const response = await axios.get<Appointment[]>(`${API_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    // 2. Filter logic (if backend sends everything)
    const hiddenStatuses = ['COMPLETED', 'CANCELLED'];

    return response.data.filter(apt =>
      !hiddenStatuses.includes(apt.status)
    );
  },
  // Create a new appointment entry in the database
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