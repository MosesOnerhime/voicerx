import axios from 'axios';

const API_URL = '/api';

// Types for auth responses
interface LoginResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string;
    isAvailable: boolean;
  };
  hospital: {
    id: string;
    name: string;
  };
  token: string;
}

interface RegisterResponse {
  message: string;
  hospital: {
    id: string;
    name: string;
    email: string;
  };
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

interface HospitalRegistrationPayload {
  hospitalName: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
}

export const authApi = {
  // POST - Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Important: allows cookies to be set
      }
    );
    return response.data;
  },

  // POST - Register new hospital with admin user
  registerHospital: async (
    payload: HospitalRegistrationPayload
  ): Promise<RegisterResponse> => {
    const response = await axios.post<RegisterResponse>(
      `${API_URL}/auth/hospital/register`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // POST - Logout user (optional - for clearing cookies on backend)
  logout: async (token?: string): Promise<void> => {
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      }
    );
  },

  // GET - Verify token and get current user (optional - for checking auth status)
  verifyToken: async (token: string): Promise<LoginResponse['user']> => {
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data.user;
  },
};