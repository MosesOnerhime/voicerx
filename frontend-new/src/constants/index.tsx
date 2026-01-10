
import { 
  LayoutDashboard, 
  Building2, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  History, 
  Settings, 
  FileText, 
  Calendar, 
  Activity, 
  ClipboardList, 
  Stethoscope, 
  UserCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const navConfig = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hospital Profile', path: '/admin/hospital-profile', icon: Building2 },
    { name: 'Upload Staff', path: '/admin/staff/upload-staff', icon: UserPlus },
    { name: 'Staff List', path: '/admin/staff/staff-list', icon: Users },
    { name: 'Roles & Permissions', path: '/admin/roles-permissions', icon: ShieldCheck },
    { name: 'Audit Logs', path: '/admin/logs', icon: History },
    { name: 'System Settings', path: '/admin/settings', icon: Settings }
  ],
  nurse: [
    { name: 'Patient Records', path: '/nurse/patients', icon: FileText },
    { name: 'Appointments', path: '/nurse/appointments', icon: Calendar },
    { name: 'Vitals Entry', path: '/nurse/vitals', icon: Activity }
  ],
  doctor: [
    { name: 'Patient Queue', path: '/doctor/queue', icon: ClipboardList },
    { name: 'Consultations', path: '/doctor/consult', icon: Stethoscope },
    { name: 'Status', path: '/doctor/status', icon: UserCheck }
  ],
  pharmacist: [
    { name: 'Dashboard', path: '/pharmacist/dashboard', icon: LayoutDashboard },
    { name: 'Pending', path: '/pharmacist/pending', icon: Clock },
    { name: 'History', path: '/pharmacist/dispensed', icon: CheckCircle2 }
  ]
};