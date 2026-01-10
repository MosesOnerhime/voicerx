import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import {
  User, Activity,
  Mic, MicOff, Loader2, Sparkles, Save
} from "lucide-react";
import { type Appointment } from "../services/types/db";
import { toast } from "../hooks/use-toast";
import { useVoiceRecording, formatDuration } from "../hooks/useVoiceRecording";
import axios from "axios";

interface PatientIntakeModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVitalsSaved?: () => void; // Callback to refresh queue after save
}

export function PatientIntakeModal({ appointment, open, onOpenChange, onVitalsSaved }: PatientIntakeModalProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  // Check if AI features are available
  useEffect(() => {
    fetch('/api/voice/status')
      .then(res => res.json())
      .then(data => setAiEnabled(data.aiEnabled))
      .catch(() => setAiEnabled(false));
  }, []);

  // Real voice recording hook
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
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: error,
      });
    },
  });

  // Form State matching backend VitalsRecord Schema
  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    pulseRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    painLevel: "",
    symptomsDescription: ""
  });

  if (!appointment) return null;

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
      toast({
        variant: "destructive",
        title: "No Recording",
        description: "Please record audio first.",
      });
      return;
    }

    if (!token) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "Please log in to use voice recording.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioBlob, 'recording.webm');
      formDataToSend.append('appointmentId', appointment.id);

      const response = await axios.post('/api/voice', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      setTranscript(data.voiceTranscript?.rawTranscript || null);
      setConfidence(data.confidence);
      setUsedVoice(true);

      // Auto-fill form fields from extracted vitals
      const vitals = data.extractedVitals;
      if (vitals) {
        setFormData(prev => ({
          ...prev,
          bloodPressureSystolic: vitals.blood_pressure_systolic?.toString() || prev.bloodPressureSystolic,
          bloodPressureDiastolic: vitals.blood_pressure_diastolic?.toString() || prev.bloodPressureDiastolic,
          pulseRate: vitals.pulse_rate?.toString() || prev.pulseRate,
          temperature: vitals.temperature?.toString() || prev.temperature,
          respiratoryRate: vitals.respiratory_rate?.toString() || prev.respiratoryRate,
          oxygenSaturation: vitals.oxygen_saturation?.toString() || prev.oxygenSaturation,
          weight: vitals.weight?.toString() || prev.weight,
          height: vitals.height?.toString() || prev.height,
          painLevel: vitals.pain_level?.toString() || prev.painLevel,
          symptomsDescription: vitals.chief_complaint || vitals.symptoms?.join(', ') || prev.symptomsDescription,
        }));
      }

      toast({
        title: "AI Analysis Complete",
        description: `Vitals extracted with ${Math.round(data.confidence * 100)}% confidence. Please review.`,
      });

    } catch (error: any) {
      console.error("Voice processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error.response?.data?.error || "Failed to process voice recording.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveVitals = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "Please log in to save vitals.",
      });
      return;
    }

    // Validate at least some vitals are entered
    const hasVitals = formData.bloodPressureSystolic || formData.pulseRate ||
                      formData.temperature || formData.symptomsDescription;

    if (!hasVitals) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter at least one vital sign or symptom description.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare payload with proper types
      const payload = {
        appointmentId: appointment.id,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        pulseRate: formData.pulseRate ? parseInt(formData.pulseRate) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        painLevel: formData.painLevel ? parseInt(formData.painLevel) : null,
        symptomsDescription: formData.symptomsDescription || null,
        recordedVia: usedVoice ? 'VOICE' : 'MANUAL',
      };

      await axios.post('/api/vitals', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: "Vitals Saved",
        description: `Vitals recorded for ${appointment.patient?.firstName} ${appointment.patient?.lastName}. Patient ready for doctor assignment.`,
      });

      // Reset form and close modal
      setFormData({
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        pulseRate: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        painLevel: "",
        symptomsDescription: ""
      });

      onOpenChange(false);

      // Refresh the queue
      if (onVitalsSaved) {
        onVitalsSaved();
      }

    } catch (error: any) {
      console.error("Save vitals error:", error);

      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          "Failed to save vitals. Please try again.";

      toast({
        variant: "destructive",
        title: "Error Saving Vitals",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block">{appointment.patient?.firstName} {appointment.patient?.lastName}</span>
                <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                  {appointment.appointmentNumber}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
              Awaiting Intake
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* LEFT SIDE: Manual Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 border-b lg:border-b-0 lg:border-r">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Vital Signs
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">BP (Systolic/Diastolic)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="120"
                      value={formData.bloodPressureSystolic}
                      onChange={(e) => setFormData({...formData, bloodPressureSystolic: e.target.value})}
                      className="text-sm"
                    />
                    <span>/</span>
                    <Input
                      placeholder="80"
                      value={formData.bloodPressureDiastolic}
                      onChange={(e) => setFormData({...formData, bloodPressureDiastolic: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Pulse (BPM)</Label>
                  <Input
                    placeholder="72"
                    value={formData.pulseRate}
                    onChange={(e) => setFormData({...formData, pulseRate: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Temp (°C)</Label>
                  <Input
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">SpO2 (%)</Label>
                  <Input
                    placeholder="98"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Weight (kg)</Label>
                  <Input
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Height (cm)</Label>
                  <Input
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Chief Complaints / Symptoms</Label>
                <Textarea
                  placeholder="Describe patient symptoms..."
                  className="h-24"
                  value={formData.symptomsDescription}
                  onChange={(e) => setFormData({...formData, symptomsDescription: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Voice Recording - Only show if AI is enabled */}
          {aiEnabled === true ? (
          <div className="w-full lg:w-[300px] bg-slate-50 p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="font-medium">AI is processing...</p>
                  <p className="text-xs text-muted-foreground px-4">Extracting vitals from your recording</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full mx-auto flex items-center justify-center transition-all ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'}`}>
                  {isRecording ? <MicOff className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" /> : <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base sm:text-lg">
                    {isRecordingPending ? "Preparing..." : isRecording ? `Recording... ${formatDuration(duration)}` : "Voice Intake"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isRecording
                      ? "Speak clearly: 'BP is 120 over 80, pulse 72...'"
                      : "Use AI to fill this form faster by recording a voice summary."}
                  </p>
                </div>

                {/* Recording Error */}
                {recordingError && (
                  <p className="text-xs text-destructive">{recordingError}</p>
                )}

                {/* Recording Button */}
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full gap-2 shadow-lg"
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
                    "Start Recording"
                  )}
                </Button>

                {/* Process Recording Button */}
                {audioBlob && !isRecording && (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={handleProcessVoice}
                    disabled={isProcessing}
                  >
                    <Sparkles className="h-4 w-4" />
                    Extract Vitals with AI
                  </Button>
                )}

                {/* Clear Button */}
                {audioBlob && !isRecording && (
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
                )}

                {/* Transcript Display */}
                {transcript && (
                  <div className="p-3 bg-white rounded-lg border text-left">
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
                    <p className="text-xs text-foreground line-clamp-3">{transcript}</p>
                  </div>
                )}

                {!isRecording && !audioBlob && (
                  <div className="pt-2 sm:pt-4 flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Powered by VoiceRX AI
                  </div>
                )}
              </div>
            )}
          </div>
          ) : (
          <div className="w-full lg:w-[300px] bg-slate-50 p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="space-y-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full mx-auto flex items-center justify-center bg-muted">
                <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-lg text-muted-foreground">Voice AI Not Available</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Please enter vitals manually using the form on the left.
                </p>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t bg-white flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Discard
          </Button>
          <Button
            className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 gap-2"
            onClick={handleSaveVitals}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Vitals
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
