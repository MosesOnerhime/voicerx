'use client'
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { StatusLegend } from "../../components/StatusLegend";
import { appointmentApi } from '../../services/api/appointments';
import { useNavigate } from 'react-router-dom';
import { 
  type Appointment, 
  type ApptStatus 
} from '../../services/types/db';

// UI Components
import { toast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, RefreshCw, UserPlus, Bell, Users } from "lucide-react";

//  local components
import { QueueStats } from "../../components/QueueStats";
import { PatientCard } from "../../components/PatientCard";
import { PatientIntakeModal } from "../../components/PatientIntakeModal";
import  RecordNewPatient  from "./RecordNewPatient";
import { DoctorAssignmentDialog } from "../../components/DoctorAssignmentDialog";

// Assuming you fetch this from your backend
const availableDoctorsCount = 5;

export default function NurseOverview() {

    const navigate = useNavigate();

    const { token } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // UI State
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newPatientOpen, setNewPatientOpen] = useState(false);
    const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);

    // 1. Fetch Appointments (The Queue)
    const fetchQueue = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const data = await appointmentApi.getNurseQueue(token);
            
            // Sort: Emergency > Urgent > Normal (UPPERCASE to match backend)
            const priorityOrder: Record<string, number> = {
                EMERGENCY: 3,
                URGENT: 2,
                NORMAL: 1
                };

                const sorted = data.sort((a, b) => {
                // Use the exact property name from your DB types
                return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
            setAppointments(sorted);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load queue." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchQueue(); }, [token]);

    // 2. Computed Stats based on DB Schema
    const stats = useMemo(() => ({
        totalPatients: appointments.length,
        awaitingVitals: appointments.filter(a => a.status === "CREATED").length,
        awaitingDoctor: appointments.filter(a => a.status === "VITALS_RECORDED").length,
        avgWaitTime: "12 min", // This would ideally come from backend analytics
    }), [appointments]);

    // 3. Filtered Appointments (Search logic)
    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const fullName = `${apt.patient?.firstName} ${apt.patient?.lastName}`.toLowerCase();
            const search = searchQuery.toLowerCase();
            return fullName.includes(search) || apt.appointmentNumber.toLowerCase().includes(search);
        });
    }, [appointments, searchQuery]);

    // 4. Action Handlers
    const handleRecordVitals = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setModalOpen(true);
    };

    const handleOpenDoctorAssignment = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setDoctorDialogOpen(true);
    };

return (
    <div className="space-y-6">
        <main className="container mx-auto px-6 py-8">
                {/* Stats Section */}
                <section className="mb-8 animate-fade-in">
                <QueueStats {...stats} />
                </section>

                {/* Queue Section */}
                <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Patient Queue</h2>
                        <p className="text-sm text-muted-foreground">
                        {filteredAppointments.length} active appointment{filteredAppointments.length !== 1 ? "s" : ""} waiting
                        </p>
                    </div>
                    <StatusLegend />
                    </div>

                    <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder="Search by name or ID..."
                        className="pl-9 w-72"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search patients"
                        />
                    </div>
                    <Button variant="outline" size="icon" aria-label="Filter patients">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Refresh queue">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    
                    {/* 3. Redirection Logic here */}
                    <Button 
                        onClick={() => navigate('/nurse/patients')} 
                        className="gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        New Patient
                    </Button>
                    
                    </div>
                </div>

                {/* Appointment List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-20">Loading queue...</div>) :
                        filteredAppointments.length === 0 ? (

                      <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
                                <p>No active appointments found.</p>
                            </div>
                        ) : (
                            filteredAppointments.map((apt, index) => (
                                <div key={apt.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * index}s` }}>
                                    <PatientCard
                                        // Pass data from the Appointment object
                                        id={apt.appointmentNumber}
                                        name={`${apt.patient?.firstName} ${apt.patient?.lastName}`}
                                        status={apt.status}
                                        priority={apt.priority}
                                        waitingTime={`${new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}

                                        // Actions
                                        onClick={() => handleRecordVitals(apt)}
                                        onRecordVitals={() => handleRecordVitals(apt)}
                                        onAssignDoctor={() => handleOpenDoctorAssignment(apt)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Circular Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setShowPopUp(!showPopUp)}
          className="relative p-4 bg-[#390C87] text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
        >
          <Users size={28} />
          {availableDoctorsCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4">
              {availableDoctorsCount}
            </span>
          )}
        </button>

        {/* Small Pop-up Notification */}
        {showPopUp && (
          <div className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-sm">Available Doctors</h3>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Live</span>
            </div>
            <div className="space-y-3">
              {/* Short list of 3 doctors */}
              {['Dr. Onerhime', 'Dr. Kosiso', 'Dr. Sarah'].map((doc) => (
                <div key={doc} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-medium">{doc}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/nurse/available-doctors')}
              className="w-full mt-4 py-2 text-xs font-bold text-[#390C87] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              View Full Directory
            </button>
          </div>
        )}
      </div>

            {/* Modals & Dialogs */}
            <PatientIntakeModal
                appointment={selectedAppointment}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />


            {selectedAppointment && (
                <DoctorAssignmentDialog
                    open={doctorDialogOpen}
                    onOpenChange={setDoctorDialogOpen}
                    appointmentId={selectedAppointment.id}
                    patientName={`${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`}
                    patientId={selectedAppointment.patientId}
                    doctors={[]} // For now, pass an empty array or your list of doctors
                    onAssign={fetchQueue} // Pass your refresh function to reload the queue after assignment
                />
            )}
        </div>
    );
}