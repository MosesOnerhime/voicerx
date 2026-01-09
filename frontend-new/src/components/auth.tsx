import axios from 'axios';
import { type LoginFormValues } from "../services/schema";

export interface RegisterFormValues extends LoginFormValues {
  name: string;
  role: 'nurse' | 'doctor' | 'pharmacist' | 'admin';
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // Login
  manualLogin: async (credentials: LoginFormValues) => {
    // Resulting URL: http://localhost:3001/api/auth/login
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: any) => {
  // This will correctly call http://localhost:3001/api/auth/register
  const response = await api.post('/auth/register', data); 
  return response.data;
}
};