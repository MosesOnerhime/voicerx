import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import type { DiagnosisTreatment, RecordStatus } from '../../services/types/db';
import { doctorApi } from '../../services/api/doctor';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout-containers';
import { Button } from '../ui/form-controls';
import { Textarea } from '../ui/form-controls';
import { Label } from '../ui/form-controls';
import { Input } from '../ui/form-controls';
import { Stethoscope, Pill, FileText, Plus, X, Save, RotateCcw, Loader2, Mic, MicOff, Sparkles, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceRecording, formatDuration } from '../../hooks/useVoiceRecording';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Prescription item structure matching backend
interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
}

interface DiagnosisTreatmentTabProps {
  patientId: string;
  diagnosisTreatment: DiagnosisTreatment;
  patientStatus: RecordStatus;
  autoStartRecording?: boolean;
  onRecordingStarted?: () => void;
  onConsultationComplete?: () => void;
}

export function DiagnosisTreatmentTab({
  patientId,
  diagnosisTreatment,
  patientStatus,
  autoStartRecording = false,
  onRecordingStarted,
  onConsultationComplete
}: DiagnosisTreatmentTabProps) {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  // Form data for consultation notes
  const [formData, setFormData] = useState({
    diagnosis: diagnosisTreatment.diagnosis,
    treatmentPlan: diagnosisTreatment.treatmentPlan,
    doctorNotes: diagnosisTreatment.doctorNotes,
  });

  // Prescription items (proper structure)
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState<PrescriptionItem>({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [prescriptionCreated, setPrescriptionCreated] = useState(false);

  // Voice AI state
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  // Check if AI features are available
  useEffect(() => {
    fetch(`${API_URL}/voice/status`)
      .then(res => res.json())
      .then(data => setAiEnabled(data.aiEnabled))
      .catch(() => setAiEnabled(false));
  }, []);

  // Voice recording hook
  const {
    isRecording,
    isPending: isRecordingPending,
    duration,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecording({
    onError: (error) => {
      toast.error(error);
    },
  });

  // Auto-start recording when consultation begins
  useEffect(() => {
    if (autoStartRecording && aiEnabled === true && !isRecording && !isRecordingPending) {
      const startAutoRecording = async () => {
        try {
          await startRecording();
          toast.success('Voice recording started automatically');
          onRecordingStarted?.();
        } catch (error) {
          console.error('Failed to auto-start recording:', error);
          onRecordingStarted?.();
        }
      };
      const timer = setTimeout(startAutoRecording, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStartRecording, aiEnabled, isRecording, isRecordingPending, startRecording, onRecordingStarted]);

  const isApproved = patientStatus === 'approved';
  const isInConsultation = patientStatus === 'updated'; // 'updated' maps to IN_CONSULTATION

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePrescriptionInputChange = (field: keyof PrescriptionItem, value: string) => {
    setNewPrescription(prev => ({ ...prev, [field]: value }));
  };

  const addPrescription = () => {
    if (newPrescription.medicationName && newPrescription.dosage &&
        newPrescription.frequency && newPrescription.duration && newPrescription.quantity) {
      setPrescriptionItems(prev => [...prev, { ...newPrescription }]);
      setNewPrescription({
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        instructions: '',
      });
      setShowPrescriptionForm(false);
      setHasChanges(true);
    } else {
      toast.error('Please fill in all required prescription fields');
    }
  };

  const removePrescription = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      setTranscript(null);
      setConfidence(null);
      await startRecording();
    }
  };

  const handleProcessVoice = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first');
      return;
    }

    if (!token) {
      toast.error('Please log in to use voice recording');
      return;
    }

    setIsProcessing(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioBlob, 'recording.webm');
      formDataToSend.append('appointmentId', patientId);

      const response = await axios.post(`${API_URL}/voice/consultation`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      setTranscript(data.transcript || null);
      setConfidence(data.confidence);

      // Auto-fill form fields from extracted notes
      const notes = data.extractedNotes;
      if (notes) {
        setFormData(prev => ({
          ...prev,
          diagnosis: notes.diagnosis || prev.diagnosis,
          treatmentPlan: notes.treatmentPlan || prev.treatmentPlan,
          doctorNotes: notes.additionalNotes || notes.assessment || prev.doctorNotes,
        }));
        setHasChanges(true);
      }

      toast.success(`Notes extracted with ${Math.round(data.confidence * 100)}% confidence. Please review.`);

    } catch (error: any) {
      console.error("Voice processing error:", error);
      toast.error(error.response?.data?.error || "Failed to process voice recording");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save consultation notes
  const handleSaveNotes = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setIsSaving(true);

      // Save consultation notes
      await doctorApi.saveConsultationNotes(patientId, {
        diagnosis: formData.diagnosis,
        treatmentPlan: formData.treatmentPlan,
        doctorNotes: formData.doctorNotes,
      }, token);

      toast.success('Consultation notes saved');
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to save consultation notes:', err);
      toast.error(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  // Create prescription and send to pharmacy
  const handleCreatePrescription = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (prescriptionItems.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    try {
      setIsSaving(true);

      // Create prescription via API
      await axios.post(`${API_URL}/prescriptions`, {
        appointmentId: patientId,
        items: prescriptionItems,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Prescription created and sent to pharmacy');
      setPrescriptionCreated(true);
    } catch (err: any) {
      console.error('Failed to create prescription:', err);
      toast.error(err.response?.data?.error || 'Failed to create prescription');
    } finally {
      setIsSaving(false);
    }
  };

  // Complete consultation
  const handleCompleteConsultation = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Validate diagnosis is entered
    if (!formData.diagnosis.trim()) {
      toast.error('Please enter a diagnosis before completing');
      return;
    }

    try {
      setIsCompleting(true);

      // First save the notes if there are changes
      if (hasChanges) {
        await doctorApi.saveConsultationNotes(patientId, {
          diagnosis: formData.diagnosis,
          treatmentPlan: formData.treatmentPlan,
          doctorNotes: formData.doctorNotes,
        }, token);
      }

      // If there are prescriptions and not yet created, create them first
      if (prescriptionItems.length > 0 && !prescriptionCreated) {
        await axios.post(`${API_URL}/prescriptions`, {
          appointmentId: patientId,
          items: prescriptionItems,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Complete the consultation
      await doctorApi.completeConsultation(patientId, token);

      toast.success(prescriptionItems.length > 0
        ? 'Consultation completed! Prescription sent to pharmacy.'
        : 'Consultation completed!');

      // Callback to refresh parent
      onConsultationComplete?.();

      // Navigate back to patients list
      navigate('/doctor/patients');
    } catch (err: any) {
      console.error('Failed to complete consultation:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      diagnosis: diagnosisTreatment.diagnosis,
      treatmentPlan: diagnosisTreatment.treatmentPlan,
      doctorNotes: diagnosisTreatment.doctorNotes,
    });
    setPrescriptionItems([]);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  if (isApproved) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Consultation Completed</p>
                <p className="text-sm text-muted-foreground">
                  This consultation has been completed and the record is now read-only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formData.diagnosis || 'Not specified'}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formData.treatmentPlan || 'Not specified'}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Doctor Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formData.doctorNotes || 'No additional notes'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT SIDE: Form Fields */}
      <div className="flex-1 space-y-6">
        {/* Diagnosis */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-healthcare-purple" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="diagnosis" className="sr-only">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              placeholder="Enter diagnosis..."
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Treatment Plan */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-healthcare-purple" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="treatmentPlan" className="sr-only">Treatment Plan</Label>
            <Textarea
              id="treatmentPlan"
              placeholder="Enter treatment plan..."
              value={formData.treatmentPlan}
              onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-healthcare-purple" />
                Prescriptions
              </span>
              {prescriptionCreated && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Sent to Pharmacy
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing prescription items */}
            {prescriptionItems.length > 0 && (
              <ul className="space-y-3">
                {prescriptionItems.map((rx, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{rx.medicationName} - {rx.dosage}</p>
                        <p className="text-xs text-muted-foreground">
                          {rx.frequency} for {rx.duration} (Qty: {rx.quantity})
                        </p>
                        {rx.instructions && (
                          <p className="text-xs text-muted-foreground italic">{rx.instructions}</p>
                        )}
                      </div>
                      {!prescriptionCreated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removePrescription(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Add prescription form */}
            {!prescriptionCreated && (
              <>
                {showPrescriptionForm ? (
                  <div className="space-y-3 p-4 border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Medication Name *</Label>
                        <Input
                          placeholder="e.g., Amoxicillin"
                          value={newPrescription.medicationName}
                          onChange={(e) => handlePrescriptionInputChange('medicationName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dosage *</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={newPrescription.dosage}
                          onChange={(e) => handlePrescriptionInputChange('dosage', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Frequency *</Label>
                        <Input
                          placeholder="e.g., 3 times daily"
                          value={newPrescription.frequency}
                          onChange={(e) => handlePrescriptionInputChange('frequency', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Duration *</Label>
                        <Input
                          placeholder="e.g., 7 days"
                          value={newPrescription.duration}
                          onChange={(e) => handlePrescriptionInputChange('duration', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity *</Label>
                        <Input
                          placeholder="e.g., 21"
                          value={newPrescription.quantity}
                          onChange={(e) => handlePrescriptionInputChange('quantity', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Instructions</Label>
                        <Input
                          placeholder="e.g., Take after meals"
                          value={newPrescription.instructions}
                          onChange={(e) => handlePrescriptionInputChange('instructions', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowPrescriptionForm(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={addPrescription}>
                        Add Medication
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowPrescriptionForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </Button>
                )}
              </>
            )}

            {/* Send to pharmacy button */}
            {prescriptionItems.length > 0 && !prescriptionCreated && (
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={handleCreatePrescription}
                disabled={isSaving}
              >
                <Send className="h-4 w-4" />
                Send to Pharmacy
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Doctor Notes */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-healthcare-purple" />
              Additional Doctor Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="doctorNotes" className="sr-only">Doctor Notes</Label>
            <Textarea
              id="doctorNotes"
              placeholder="Enter additional notes..."
              value={formData.doctorNotes}
              onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={(!hasChanges && prescriptionItems.length === 0) || isSaving || isCompleting}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Discard Changes
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveNotes}
            disabled={!hasChanges || isSaving || isCompleting}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handleCompleteConsultation}
            disabled={isCompleting || isSaving || !formData.diagnosis.trim()}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* RIGHT SIDE: Voice Recording Panel */}
      {aiEnabled === true ? (
        <div className="w-full lg:w-[320px] shrink-0">
          <Card className="shadow-card sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Voice Notes AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              {isProcessing ? (
                <div className="space-y-4 py-4">
                  <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="font-medium">AI is processing...</p>
                    <p className="text-xs text-muted-foreground">Extracting consultation notes</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-purple-100'
                  }`}>
                    {isRecording ? (
                      <MicOff className="h-8 w-8 text-red-600" />
                    ) : (
                      <Mic className="h-8 w-8 text-purple-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold">
                      {isRecordingPending ? "Preparing..." : isRecording ? `Recording... ${formatDuration(duration)}` : "Voice Consultation"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isRecording
                        ? "Speak your diagnosis, treatment plan, and prescriptions..."
                        : "Use AI to transcribe and extract consultation notes from your voice."}
                    </p>
                  </div>

                  {recordingError && (
                    <p className="text-xs text-destructive">{recordingError}</p>
                  )}

                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full gap-2"
                    onClick={handleToggleRecording}
                    disabled={isRecordingPending || isProcessing}
                  >
                    {isRecordingPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : isRecording ? (
                      "Stop Recording"
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>

                  {audioBlob && !isRecording && (
                    <>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={handleProcessVoice}
                        disabled={isProcessing}
                      >
                        <Sparkles className="h-4 w-4" />
                        Extract Notes with AI
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          resetRecording();
                          setTranscript(null);
                          setConfidence(null);
                        }}
                      >
                        Clear Recording
                      </Button>
                    </>
                  )}

                  {transcript && (
                    <div className="w-full p-3 bg-slate-50 rounded-lg border text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Transcript</span>
                        {confidence !== null && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                            confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {Math.round(confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground line-clamp-4">{transcript}</p>
                    </div>
                  )}

                  {!isRecording && !audioBlob && (
                    <div className="pt-2 flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" /> Powered by VoiceRX AI
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : aiEnabled === false ? (
        <div className="w-full lg:w-[320px] shrink-0">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                <Mic className="h-4 w-4" />
                Voice Notes AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center py-8">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MicOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-muted-foreground">Voice AI Not Available</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Please enter notes manually using the form.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full lg:w-[320px] shrink-0">
          <Card className="shadow-card">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
