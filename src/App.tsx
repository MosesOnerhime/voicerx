import { Toaster } from "./components/ui/overlays-and-feedback";
import { TooltipProvider } from "./components/ui/data-display";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientRecord from "./pages/PatientRecord";
import ReviewApproval from "./pages/ReviewApproval";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Records from "./pages/Records";
import NotFound from "./pages/NotFound";

// If you have a Layout component that contains your Sidebar, import it here:
// import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Our consolidated Toaster handles all feedback/alerts */}
      <Toaster /> 
      
      <BrowserRouter>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patient/:patientId" element={<PatientRecord />} />
          <Route path="/patient/:patientId/review" element={<ReviewApproval />} />
          <Route path="/records" element={<Records />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Catch-all for 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;