'use client'
import './App.css'
import Gendashboard from './components/Gendashboard';
import Register from './pages/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NurseOverview from './pages/nurse/NurseOverview';
import PatientsPage from './pages/nurse/PatientsPage';
// import { RoleGuard } from './components/RoleGuard';
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

function App() {

  return(

    <BrowserRouter>
      <Routes>

        {/*Public Routes*/}
        <Route path="/" element={<Register />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route element={<Gendashboard />}>

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hospital-profile" element={<HospitalProfile />} />
          <Route path="/admin/staff/upload-staff" element={<UploadStaff />} />
          <Route path="/admin/staff/staff-list" element={<StaffList />} />
          <Route path="/admin/roles-permissions" element={<RolesPermissions/>} />
          <Route path="/admin/logs" element={<AuditLogs/>} />
          <Route path="/admin/settings" element={<SystemSettings/>} />


          {/* Nurse Routes */}
          <Route path="/nurse/dashboard" element={<NurseOverview />} />
          <Route path="/nurse/patients" element={<PatientsPage />} />
          <Route path="/nurse/register-patient" element={<RecordNewPatient />} />

          {/* Pharmacist Routes */}
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/pending" element={<PharmacyPending />} />
          <Route path="/pharmacy/dispensed" element={<PharmacyDispensed />} />

        </Route>
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>

  )
}

export default App;