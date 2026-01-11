import axios from 'axios';
import { type Appointment } from '../types/db';

const API_URL = '/api';

export const appointmentApi = {
getNurseQueue: async (token: string) => {
  const response = await axios.get(`${API_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const appointmentsArray = response.data.appointments || [];
  
  const hiddenStatuses = ['COMPLETED', 'CANCELLED'];
  return appointmentsArray.filter((apt: any) => {
    const status = apt.status?.toUpperCase(); 
    return !hiddenStatuses.includes(status);
  });
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