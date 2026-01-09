'use client'
import './App.css'
import Gendashboard from './components/Gendashboard';
import Register from './pages/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NurseOverview from './pages/nurse/NurseOverview';
import PatientsPage from './pages/nurse/PatientsPage';
import { RoleGuard } from './components/RoleGuard';
import RecordNewPatient from './pages/nurse/RecordNewPatient';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDBD';
import PharmacyDashboard from './pages/pharmacy/PharmacyOverview';
import PharmacyPending from './pages/pharmacy/PharmacyPending';
import PharmacyDispensed from './pages/pharmacy/PharmacyDispensed';


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

          {/* Nurse Routes */}
          <Route path="/nurse/dashboard" element={<NurseOverview />} />
          <Route path="/nurse/patients" element={<PatientsPage />} />
          <Route path="/nurse/register-patient" element={<RecordNewPatient />} />

          {/* Pharmacist Routes */}
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/pending" element={<PharmacyPending />} />
          <Route path="/pharmacy/dispensed" element={<PharmacyDispensed />} />

        </Route>

      </Routes>
    </BrowserRouter>

  )
}

export default App;