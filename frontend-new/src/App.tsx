'use client'
import './App.css'
import Gendashboard from './components/Gendashboard';
import Register from './pages/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NurseOverview from './pages/nurse/NurseOverview';
import PatientsPage from './pages/nurse/PatientsPage';
//import { Appointment } from './pages/nurse/Appointment'
import { RoleGuard } from './components/RoleGuard';
import RecordNewPatient from './pages/nurse/RecordNewPatient';
import SignUp from './pages/SignUp';


function App() {
  
  return(
    
    <BrowserRouter>
      <Routes>

        {/*Public Routes*/}
        <Route path="/" element={<Register />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route element={<Gendashboard />}>
    
        {/* Nurse Protected Routes */}
        {/*<Route element={<RoleGuard allowedRoles={['nurse', 'admin']} />}>*/}
           <Route path="/nurse/dashboard" element={<NurseOverview />} />
           <Route path="/nurse/patients" element={<PatientsPage />} />
           <Route path="/nurse/register-patient" element={<RecordNewPatient />} />
      
        </Route>
        {/*</Route>*/}

      </Routes>
    </BrowserRouter>
    
  )
}

export default App;