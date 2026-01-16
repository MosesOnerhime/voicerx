import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { StatusBadge } from '../../components/ui/data-display';
import { Button } from '../../components/ui/form-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/navigations';
import { doctorApi } from '../../services/api/doctor';
import { transformQueueItemToPatientAppt, type DoctorQueueItem } from '../../services/types/doctor';
import { ArrowLeft, Calendar, User, Clock, Loader2, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { calculateAge } from '../../lib/dateUtils';
import { toast } from 'sonner';

// Sub-tab components
import { OverviewTab } from '../../components/patient/OverviewTab';
import { IntakeNotesTab } from '../../components/patient/IntakeNotesTab';
import { DiagnosisTreatmentTab } from '../../components/patient/DiagnosisTreatmentTab';
import { HistoryTab } from '../../components/patient/HistoryTab';

export default function PatientRecord() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [record, setRecord] = useState<ReturnType<typeof transformQueueItemToPatientAppt> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingConsultation, setIsStartingConsultation] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!token || !patientId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const appointment = await doctorApi.getAppointmentById(patientId, token);
      const transformed = transformQueueItemToPatientAppt(appointment as DoctorQueueItem);
      setRecord(transformed);
    } catch (err: any) {
      console.error('Failed to fetch appointment:', err);
      setError(err.response?.data?.message || 'Failed to load patient record');
    } finally {
      setIsLoading(false);
    }
  }, [token, patientId]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const [shouldAutoStartRecording, setShouldAutoStartRecording] = useState(false);

  const handleStartConsultation = async () => {
    if (!token || !patientId) return;

    try {
      setIsStartingConsultation(true);
      await doctorApi.startConsultation(patientId, token);
      toast.success('Consultation started - Recording will begin automatically');
      // Switch to diagnosis tab and trigger auto-start recording
      setActiveTab('diagnosis');
      setShouldAutoStartRecording(true);
      // Refresh the appointment data to get updated status
      await fetchAppointment();
    } catch (err: any) {
      console.error('Failed to start consultation:', err);
      toast.error(err.response?.data?.message || 'Failed to start consultation');
    } finally {
      setIsStartingConsultation(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading patient record...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-foreground">Failed to load patient record</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => fetchAppointment()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
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

  const { patient, status, visitDate } = record;
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const canStartConsultation = status === 'pending';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
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
                  ID: {patient.patientIdNumber || patient.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center">
            {canStartConsultation && (
              <Button
                onClick={handleStartConsultation}
                disabled={isStartingConsultation}
                className="gap-2"
              >
                {isStartingConsultation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Consultation
              </Button>
            )}
            <StatusBadge status={status} className="self-start md:self-center" />
          </div>
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
          <IntakeNotesTab intakeNotes={record.intakeNotes} />
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-6">
          <DiagnosisTreatmentTab
            patientId={patientId || ''}
            diagnosisTreatment={record.diagnosisTreatment}
            patientStatus={status}
            autoStartRecording={shouldAutoStartRecording}
            onRecordingStarted={() => setShouldAutoStartRecording(false)}
            onConsultationComplete={fetchAppointment}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab history={record.history || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
