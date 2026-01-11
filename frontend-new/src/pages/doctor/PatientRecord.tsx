import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { StatusBadge } from '../../components/ui/data-display';
import { Button } from '../../components/ui/form-controls'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/navigations';
import { MOCK_DASHBOARD_DATA } from '../../data/mockData';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

// Sub-tab components
import { OverviewTab } from '../../components/patient/OverviewTab';
import { IntakeNotesTab } from '../../components/patient/IntakeNotesTab';
import { DiagnosisTreatmentTab } from '../../components/patient/DiagnosisTreatmentTab';
import { HistoryTab } from '../../components/patient/HistoryTab';

export default function PatientRecord() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const record = patientId ? MOCK_DASHBOARD_DATA[patientId] : null;

  if (!record) {
    return (
      <DoctorLayout title="Patient Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Patient record not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  const { patient } = record;

  return (
    <DoctorLayout 
      title="Patient Record" 
      subtitle={patient.name}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/patients')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>

        {/* Patient Header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-healthcare-purple-light text-xl font-semibold text-healthcare-purple">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{patient.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {patient.age} yrs, {patient.gender}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Visit: {patient.visitDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    ID: {patient.id}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={patient.status} className="self-start md:self-center" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="intake" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
            >
              Intake Notes
            </TabsTrigger>
            <TabsTrigger 
              value="diagnosis" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
            >
              Diagnosis & Treatment
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab record={record} />
          </TabsContent>

          <TabsContent value="intake" className="mt-6">
            <IntakeNotesTab intakeNotes={record.intakeNotes} />
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-6">
            <DiagnosisTreatmentTab 
              patientId={patient.id}
              diagnosisTreatment={record.diagnosisTreatment}
              patientStatus={patient.status}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab history={record.history} />
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
}
