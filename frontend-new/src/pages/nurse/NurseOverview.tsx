'use client'
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { StatusLegend } from "../../components/StatusLegend";
import { appointmentApi } from '../../services/api/appointments';
import { useNavigate } from 'react-router-dom';
import { type Appointment } from '../../services/types/db';
import axios from 'axios';

// UI Components
import { toast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, RefreshCw, UserPlus, Users } from "lucide-react";

//  local components
import { QueueStats } from "../../components/QueueStats";
import { PatientCard } from "../../components/PatientCard";
import { PatientIntakeModal } from "../../components/PatientIntakeModal";
import { DoctorAssignmentDialog } from "../../components/DoctorAssignmentDialog";

interface AvailableDoctor {
  id: string;
  name: string;
  specialty: string;
  currentPatients: number;
  availability: "available" | "busy";
}

export default function NurseOverview() {
    const navigate = useNavigate();

    const { token } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>([]);

    // UI State
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
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

            const sorted = data.sort((a: Appointment, b: Appointment) => {
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

    // 1b. Fetch Available Doctors
    const fetchDoctors = async () => {
        if (!token) return;
        try {
            const response = await axios.get('/api/doctors/available', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Map to include availability field for DoctorAssignmentDialog
            const doctors = (response.data.doctors || []).map((doc: AvailableDoctor) => ({
                ...doc,
                availability: "available" as const,
            }));
            setAvailableDoctors(doctors);
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        }
    };

    // Updated useEffect with auto-refresh on window focus
    useEffect(() => {
        fetchQueue();
        fetchDoctors();
        
        // Auto-refresh when window regains focus
        const handleFocus = () => {
            fetchQueue();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [token]);

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

    const handleRefresh = () => {
        fetchQueue();
        toast({ title: "Refreshed", description: "Queue updated successfully" });
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
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={handleRefresh}
                                aria-label="Refresh queue"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            
                            {/* New Patient Button */}
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
                            <div className="text-center py-20">Loading queue...</div>
                        ) : filteredAppointments.length === 0 ? (
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
                                        onStartIntake={() => handleRecordVitals(apt)}
                                        onRecordVitals={() => handleRecordVitals(apt)}
                                        onUpdateVitals={() => handleRecordVitals(apt)}
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
                    {availableDoctors.length > 0 && (
                        <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4">
                            {availableDoctors.length}
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
                            {availableDoctors.length === 0 ? (
                                <p className="text-sm text-gray-500">No doctors available</p>
                            ) : (
                                availableDoctors.slice(0, 3).map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600 font-medium">{doc.name}</span>
                                    </div>
                                ))
                            )}
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
                onVitalsSaved={fetchQueue}
            />

            {selectedAppointment && (
                <DoctorAssignmentDialog
                    open={doctorDialogOpen}
                    onOpenChange={setDoctorDialogOpen}
                    appointmentId={selectedAppointment.id}
                    patientName={`${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`}
                    patientId={selectedAppointment.patientId}
                    doctors={availableDoctors}
                    onAssign={() => { fetchQueue(); fetchDoctors(); }}
                />
            )}
        </div>
    );
}