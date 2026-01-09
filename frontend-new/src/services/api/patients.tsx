import axios from 'axios';

// what a Patient looks like in your DB
import type { Patient } from '../types/db';

const API_URL = 'http://localhost:3000/api';

export const patientApi = {
  getAll: async (token: string) => {
    const response = await axios.get<Patient[]>(`${API_URL}/patients`, {
      headers: {
        Authorization: `Bearer ${token}`, // backend needs to know who is asking
      },
    });
    return response.data;
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

  //edit a patient info

};