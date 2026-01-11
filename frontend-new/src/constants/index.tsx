import { 
  LayoutDashboard, Building2, UserPlus, Users, ShieldCheck, 
  History, Settings, FileText, Bell, User, Clock, CheckCircle2 
} from 'lucide-react';

// 1. Define the interface (Capital NavItem)
interface NavItem {
  name: string;
  path: string; // Ensure every item has this
  icon: any; 
  children?: NavItem[]; 
}

// 2. Define the configuration as a Record of Roles
// Use 'NavItem[]' instead of 'navItem[]'
export const navConfig: Record<'admin' | 'nurse' | 'doctor' | 'pharmacist', NavItem[]> = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hospital Profile', path: '/admin/hospital-profile', icon: Building2 },
    {
      name: 'Staff Management',
      path: '#', // Added missing path for the parent dropdown
      icon: Users,
      children: [
        { name: 'Upload Staff', path: '/admin/staff/upload-staff', icon: UserPlus },
        { name: 'Staff List', path: '/admin/staff/staff-list', icon: Users },
      ]
    },
    { name: 'Roles & Permissions', path: '/admin/roles-permissions', icon: ShieldCheck },
    { name: 'Audit Logs', path: '/admin/logs', icon: History },
    { name: 'System Settings', path: '/admin/settings', icon: Settings }
  ],
  nurse: [
    { name: 'Dashboard', path: '/nurse/dashboard', icon: LayoutDashboard },
    { name: 'Patient Records', path: '/nurse/patients', icon: FileText },
    { name: 'Register Patient', path: '/nurse/register-patient', icon: UserPlus },
    { name: 'Available Doctors', path: '/nurse/available-doctors', icon: Users } // Changed icon to Users for better UX
  ],
  doctor: [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Records', path: '/doctor/records', icon: FileText },
    { name: 'Notifications', path: '/doctor/notifications', icon: Bell },
    { name: 'Profile', path: '/doctor/profile', icon: User }
  ],
  pharmacist: [
    { name: 'Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
    { name: 'Pending', path: '/pharmacy/pending', icon: Clock },
    { name: 'Dispensed', path: '/pharmacy/dispensed', icon: CheckCircle2 }
  ]
};