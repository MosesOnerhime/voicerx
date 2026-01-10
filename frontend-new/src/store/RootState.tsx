// src/store/index.ts (or your store file)
// src/store/index.ts (or your store file)

// 1. Define strict types for Roles so you don't make typos later
export type UserRole = 'nurse' | 'admin' | 'doctor' | 'pharmacist';

// 2. Define the User structure matching your Backend response (camelCase)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  hospitalId: {
    _id: string;
    name: string;
  };
  avatar?: string; // Optional profile picture URL
}
export interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
}

export interface Hospital {
    hospitalName: string;
    hospitalEmail: string;
    hospitalPhone: string;
    hospitalAddress: string;
    registrationNumber: number;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
}
