'use client'
import './App.css'
import Gendashboard from './components/Gendashboard';
import Register from './pages/Register'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from "./components/ui/overlays-and-feedback";
import { TooltipProvider } from "./components/ui/data-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NurseOverview from './pages/nurse/NurseOverview';
import PatientsPage from './pages/nurse/PatientsPage';
import { Provider } from 'react-redux';
import RecordNewPatient from './pages/nurse/RecordNewPatient';
import SignUp from './pages/SignUp';
import PharmacyDashboard from './pages/pharmacy/PharmacyOverview';
import PharmacyPending from './pages/pharmacy/PharmacyPending';
import PharmacyDispensed from './pages/pharmacy/PharmacyDispensed';
import HospitalProfile from './pages/admin/HospitalProfile';
import UploadStaff from './pages/admin/UploadStaff';
import StaffList from './pages/admin/StaffList';
import RolesPermissions from './pages/admin/RolesPermissions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import NotFound from './pages/NotFound';
import Dashboard from "./pages/doctor/Dashboard";
import PatientList from "./pages/doctor/PatientList";
import PatientRecord from "./pages/doctor/PatientRecord";
import ReviewApproval from "./pages/doctor/ReviewApproval";
import Notifications from "./pages/doctor/Notifications";
import Profile from "./pages/doctor/Profile";
import Records from "./pages/doctor/Records";
import AvailableDoctors from './pages/nurse/AvailableDoctors';
import Index from './pages/Index';
import { RoleGuard } from './components/RoleGuard';
import { store } from './store';
import NoAccess from './pages/NoAccess';

const queryClient = new QueryClient();

function App() {

  return(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Our consolidated Toaster handles all feedback/alerts */}
      <Toaster /> 

    <BrowserRouter>
      <Routes>

        {/*Public Routes*/}
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<Register />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route element={<Gendashboard />}>

          {/* Admin Routes */}
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hospital-profile" element={<HospitalProfile />} />
          <Route path="/admin/staff/upload-staff" element={<UploadStaff />} />
          <Route path="/admin/staff/staff-list" element={<StaffList />} />
          <Route path="/admin/roles-permissions" element={<RolesPermissions/>} />
          <Route path="/admin/logs" element={<AuditLogs/>} />
          <Route path="/admin/settings" element={<SystemSettings/>} />
          </Route>


          {/* Nurse Routes */}
          <Route element={<RoleGuard allowedRoles={['nurse']} />}>
          <Route path="/nurse/dashboard" element={<NurseOverview />} />
          <Route path="/nurse/patients" element={<PatientsPage />} />
          <Route path="/nurse/register-patient" element={<RecordNewPatient />} />
          <Route path="/nurse/available-doctors" element={<AvailableDoctors />} />
          </Route>

          {/* Pharmacist Routes */}
          <Route element={<RoleGuard allowedRoles={['pharmacist']} />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/pending" element={<PharmacyPending />} />
          <Route path="/pharmacy/dispensed" element={<PharmacyDispensed />} />
          </Route>


          {/* Doctor Routes */}
          <Route element={<RoleGuard allowedRoles={['doctor']} />}>
          <Route path="/doctor/dashboard" element={<Dashboard />} />
          <Route path="/doctor/patients" element={<PatientList />} />
          <Route path="/doctor/patient/:patientId" element={<PatientRecord />} />
          <Route path="/doctor/patient/:patientId/review" element={<ReviewApproval />} />
          <Route path="/doctor/records" element={<Records />} />
          <Route path="/doctor/notifications" element={<Notifications />} />
          <Route path="/doctor/profile" element={<Profile />} />
          </Route>
          

        </Route>

        {/* Redirects for old paths */}
        <Route path="/hospital-profile" element={<Navigate to="/admin/hospital-profile" replace />} />
        <Route path="/staff/upload" element={<Navigate to="/admin/staff/upload-staff" replace />} />
        <Route path="/staff/list" element={<Navigate to="/admin/staff/staff-list" replace />} />
        <Route path="/unauthorized" element={<NoAccess />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </Provider>

  )
}

export default App;