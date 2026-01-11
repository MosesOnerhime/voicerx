import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/data-display';
import { Button } from '../../components/ui/form-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/navigations';
import { MOCK_DASHBOARD_DATA } from '../../data/mockData';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { calculateAge } from '../../lib/dateUtils';

// Sub-tab components
import { OverviewTab } from '../../components/patient/OverviewTab';
import { IntakeNotesTab } from '../../components/patient/IntakeNotesTab';
import { DiagnosisTreatmentTab } from '../../components/patient/DiagnosisTreatmentTab';
import { HistoryTab } from '../../components/patient/HistoryTab';

export default function PatientRecord() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Find the record in the mock array
  const record = patientId ? MOCK_DASHBOARD_DATA.find(item => item.patient.id === patientId) : null;

  // 1. Safety check: Handle the "Not Found" state
  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground font-medium">Patient record not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/doctor/patients')}>
          Back to Patients
        </Button>
      </div>
    );
  }

  // 2. Destructure properties from the found record
  const { patient, status, visitDate } = record;
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button - uses navigate(-1) for better UX */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className="gap-2 -ml-2 text-gray-600 hover:text-[#390C87]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Button>

      {/* Patient Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with Initials */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-[#390C87]">
              {initials.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {calculateAge(patient.dateOfBirth)} yrs, {patient.gender}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Visit: {visitDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ID: {patient.patientIdNumber}
                </span>
              </div>
            </div>
          </div>
          {/* Use the appointment 'status' for the badge */}
          <StatusBadge status={status} className="self-start md:self-center" />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-gray-50 border border-gray-200 rounded-xl p-1 h-auto">
          {['overview', 'intake', 'diagnosis', 'history'].map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              className="data-[state=active]:bg-[#390C87] data-[state=active]:text-white rounded-lg px-6 py-2 capitalize font-semibold transition-all"
            >
              {tab === 'diagnosis' ? 'Diagnosis & Treatment' : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab record={record} />
        </TabsContent>

        <TabsContent value="intake" className="mt-6">
          <IntakeNotesTab intakeNotes={(record as any).intakeNotes} />
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-6">
          <DiagnosisTreatmentTab 
            patientId={patient.id}
            diagnosisTreatment={(record as any).diagnosisTreatment}
            patientStatus={status}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab history={(record as any).history || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}