'use client'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { patientApi } from '../../services/api/patients';
import { CreateAppointmentDialog } from "../../components/CreateAppointmentDialog";
import { toast } from "../../hooks/use-toast";
import { type Patient } from '../../services/types/db';
import { useNavigate } from 'react-router-dom';

//apis
import { appointmentApi } from '../../services/api/appointments';

// UI Components
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { MoreHorizontal, Edit, Trash2, CalendarPlus, User, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const statusStyles = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  INACTIVE: "bg-muted text-muted-foreground border-border",
};

const PatientTable = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isApptDialogOpen, setIsApptDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleOpenApptDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsApptDialogOpen(true);
  };


  const handleCreateAppointment = async (payload: any) => {
  if (!token) {
    toast({ variant: "destructive", title: "Error", description: "You are not authenticated." });
    return;
  }
  try {
    console.log("Sending to backend:", payload);
    
    await appointmentApi.create(payload, token); 

    toast({
      title: "Success",
      description: "Appointment created successfully. Redirecting to queue...",
    });

    // Close the dialog
    setIsApptDialogOpen(false);
    
    // Navigate to nurse dashboard to see the new appointment
    setTimeout(() => {
      navigate('/nurse/dashboard');
    }, 1500);

  } catch (error: any) {
    console.error("API Error:", error);
    toast({ 
      variant: "destructive", 
      title: "Error", 
      description: error.response?.data?.message || "Failed to create appointment" 
    });
  }
};

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;
      try {
        const data = await patientApi.getAll(token);
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-border bg-white/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Patient Registry</h3>
            <p className="text-sm text-muted-foreground">Manage all registered hospital patients</p>
          </div>
          <Button 
            size="sm" 
            className="bg-primary text-white hover:opacity-90"
            onClick={() => navigate("/nurse/patients/new")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Register New Patient
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined At</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  Loading patients...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-1">No patients found</p>
                      <p className="text-sm text-muted-foreground mb-4">Get started by registering your first patient</p>
                      <Button 
                        onClick={() => navigate("/nurse/patients/new")}
                        className="bg-primary text-white hover:opacity-90"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register First Patient
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient, index) => (
                <tr
                  key={patient.id}
                  className="hover:bg-muted/30 transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">{patient.patientIdNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={statusStyles[patient.status as keyof typeof statusStyles]}
                    >
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(patient.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Patient Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-primary focus:text-primary"
                          onClick={() => handleOpenApptDialog(patient)}
                        >
                          <CalendarPlus size={14} className="mr-2" />
                          Create Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer" 
                          onClick={() => navigate(`/nurse/patients/${patient.id}`)}
                        >
                          <User size={14} className="mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer" 
                          onClick={() => navigate(`/nurse/patients/${patient.id}?edit=true`)}
                        >
                          <Edit size={14} className="mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer">
                          <Trash2 size={14} className="mr-2" />
                          Archive Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/*Dialog component*/}
      <CreateAppointmentDialog 
        open={isApptDialogOpen}
        onOpenChange={setIsApptDialogOpen}
        patient={selectedPatient}
        onSubmit={handleCreateAppointment}
      />
    </div>
  );
};

export default PatientTable