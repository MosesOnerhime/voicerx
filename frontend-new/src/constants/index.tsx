export const navItems = [
    {label: "Home", href: "#home"},
    {label: "About Me", href: "#about"},
    {label: "Portfolio", href: "#projects"},
    {label: "Services", href: "#services"},
    

]

// src/config/navigation.ts
export const navConfig = {
  admin: [
    { name: 'Hospital Registry', path: '/admin/hospitals' },
    { name: 'Staff Documents', path: '/admin/docs' },
    {name: 'All records', path: '/admin/records'},
    { name: 'All records', path: '/admin/records/patients' },
    { name: 'All records', path: '/admin/records/doctors' },
    { name: 'System Config', path: '/admin/config' }
  ],
  nurse: [
    { name: 'Patient Records', path: '/nurse/patients' },
    { name: 'Appointments', path: '/nurse/appointments' },
    { name: 'Vitals Entry', path: '/nurse/vitals' }
  ],
  doctor: [
    { name: 'Patient Queue', path: '/doctor/queue' },
    { name: 'Consultations', path: '/doctor/consult' },
    { name: 'Status', path: '/doctor/status' }
  ],
  pharmacist: [
    { name: 'Dashboard', path: '/pharmacist/dashboard' },
    { name: 'Pending', path: '/pharmacist/pending' },
    { name: 'History', path: '/pharmacist/dispensed' }
  ]
};