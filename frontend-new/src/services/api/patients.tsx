import axios from 'axios';

// what a Patient looks like in your DB
import type { Patient } from '../types/db';

const API_URL = '/api';

export const patientApi = {
  getAll: async (token: string): Promise<Patient[]> => {
    const response = await axios.get(`${API_URL}/patients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Backend returns { patients: [...], pagination: {...} }
    return response.data.patients || [];
  },
  // Create a new patient entry in the database
  create: async (payload: any, token: string) => {
    const response = await axios.post(`${API_URL}/patients`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  },

  // Edit a patient info**
  update: async (id: string, payload: Partial<Patient>, token: string) => {
    const response = await axios.patch(`${API_URL}/patients/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  },
};