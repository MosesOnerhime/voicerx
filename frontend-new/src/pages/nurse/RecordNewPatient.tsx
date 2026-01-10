'use client'
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { ArrowLeft, Save, UserPlus, ClipboardList, ShieldAlert, Phone, Loader2, Mic, MicOff, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "../../hooks/use-toast";
import { patientApi } from "../../services/api/patients";
import { useVoiceRecording, formatDuration } from "../../hooks/useVoiceRecording";

// Validation Schema - matches backend requirements
const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  // Emergency contact - all required by backend
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  // Optional Fields
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  genotype: z.string().optional(),
  knownAllergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function RecordNewPatient() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  // Voice recording state
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null); // null = loading

  // Check if AI features are available
  useEffect(() => {
    fetch('/api/voice/status')
      .then(res => res.json())
      .then(data => setAiEnabled(data.aiEnabled))
      .catch(() => setAiEnabled(false));
  }, []);

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

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bloodType: "",
      genotype: "",
      address: "",
      phoneNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      knownAllergies: "",
      chronicConditions: "",
      currentMedications: "",
    },
  });

  // Process voice recording and extract patient info
  const processVoiceRecording = async () => {
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
        description: "Please log in to use voice registration.",
      });
      return;
    }

    setIsProcessingVoice(true);
    setTranscript(null);
    setConfidence(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/patient-registration', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice recording');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setConfidence(data.confidence);

      // Auto-fill form fields from extracted data
      const extracted = data.extractedData;

      if (extracted.firstName) form.setValue("firstName", extracted.firstName);
      if (extracted.lastName) form.setValue("lastName", extracted.lastName);
      if (extracted.dateOfBirth) form.setValue("dateOfBirth", extracted.dateOfBirth);
      if (extracted.gender) form.setValue("gender", extracted.gender);
      if (extracted.phoneNumber) form.setValue("phoneNumber", extracted.phoneNumber);
      if (extracted.email) form.setValue("email", extracted.email);
      if (extracted.address) form.setValue("address", extracted.address);
      if (extracted.emergencyContactName) form.setValue("emergencyContactName", extracted.emergencyContactName);
      if (extracted.emergencyContactPhone) form.setValue("emergencyContactPhone", extracted.emergencyContactPhone);
      if (extracted.emergencyContactRelationship) form.setValue("emergencyContactRelationship", extracted.emergencyContactRelationship);
      if (extracted.bloodType) form.setValue("bloodType", extracted.bloodType);
      if (extracted.genotype) form.setValue("genotype", extracted.genotype);
      if (extracted.knownAllergies) form.setValue("knownAllergies", extracted.knownAllergies);
      if (extracted.chronicConditions) form.setValue("chronicConditions", extracted.chronicConditions);
      if (extracted.currentMedications) form.setValue("currentMedications", extracted.currentMedications);

      toast({
        title: "Voice Processed",
        description: `Extracted patient info with ${Math.round(data.confidence * 100)}% confidence. Please review and complete any missing fields.`,
      });

    } catch (error: any) {
      console.error("Voice processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error.message || "Failed to process voice recording.",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Handle recording toggle
  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const onSubmit = async (data: PatientFormValues) => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "Please log in to register patients.",
      });
      return;
    }

    try {
      const result = await patientApi.create(data, token);

      toast({
        title: "Success!",
        description: `Patient ${result.patient.firstName} ${result.patient.lastName} registered with ID: ${result.patient.patientIdNumber}`,
      });

      // Navigate back to patients list
      navigate('/nurse/patients');
    } catch (error: any) {
      console.error("Patient registration error:", error);

      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          "There was an error saving the patient record.";

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Register New Patient
          </h1>
        </div>
      </div>

      {/* Voice Registration Section - Only show if AI is enabled */}
      {aiEnabled === true && (
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-6 rounded-xl border border-primary/20 shadow-sm mb-6 sm:mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Voice Registration
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">AI-Powered</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Speak the patient's information and AI will automatically fill out the form for you.
            </p>

            {/* Recording Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                className={`gap-2 ${isRecording ? 'animate-pulse' : ''}`}
                onClick={handleRecordingToggle}
                disabled={isRecordingPending || isProcessingVoice}
              >
                {isRecordingPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording ({formatDuration(duration)})
                  </>
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
                    type="button"
                    variant="secondary"
                    onClick={processVoiceRecording}
                    disabled={isProcessingVoice}
                    className="gap-2"
                  >
                    {isProcessingVoice ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Extract Patient Info
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetRecording();
                      setTranscript(null);
                      setConfidence(null);
                    }}
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>

            {/* Recording Error */}
            {recordingError && (
              <p className="text-sm text-destructive mt-2">{recordingError}</p>
            )}

            {/* Transcript Display */}
            {transcript && (
              <div className="mt-4 p-3 bg-white/50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Transcript</span>
                  {confidence !== null && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{transcript}</p>
              </div>
            )}

            {/* Recording Tips */}
            {!transcript && !isRecording && !audioBlob && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Say something like: "I'm registering John Smith, male, born January 15th 1985,
                  phone number is +234 801 234 5678, his wife Jane is the emergency contact at +234 802 345 6789..."
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input {...form.register("firstName")} placeholder="John" />
              {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input {...form.register("lastName")} placeholder="Doe" />
              {form.formState.errors.lastName && <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input type="date" {...form.register("dateOfBirth")} />
              {form.formState.errors.dateOfBirth && <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={form.watch("gender")} onValueChange={(v) => form.setValue("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input {...form.register("phoneNumber")} placeholder="+234..." />
              {form.formState.errors.phoneNumber && <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input {...form.register("email")} type="email" placeholder="patient@email.com" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input {...form.register("address")} placeholder="123 Main Street, Lagos" />
            </div>
          </div>
        </div>

        {/* Section 2: Emergency Contact */}
        <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <Phone className="h-5 w-5 text-orange-500" />
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name *</Label>
              <Input {...form.register("emergencyContactName")} placeholder="Jane Doe" />
              {form.formState.errors.emergencyContactName && <p className="text-xs text-destructive">{form.formState.errors.emergencyContactName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
              <Input {...form.register("emergencyContactPhone")} placeholder="+234..." />
              {form.formState.errors.emergencyContactPhone && <p className="text-xs text-destructive">{form.formState.errors.emergencyContactPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Relationship *</Label>
              <Select value={form.watch("emergencyContactRelationship")} onValueChange={(v) => form.setValue("emergencyContactRelationship", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                  <SelectItem value="CHILD">Child</SelectItem>
                  <SelectItem value="SIBLING">Sibling</SelectItem>
                  <SelectItem value="FRIEND">Friend</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.emergencyContactRelationship && <p className="text-xs text-destructive">{form.formState.errors.emergencyContactRelationship.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Medical Info */}
        <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Medical Information (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Select value={form.watch("bloodType")} onValueChange={(v) => form.setValue("bloodType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Genotype</Label>
              <Select value={form.watch("genotype")} onValueChange={(v) => form.setValue("genotype", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AA">AA</SelectItem>
                  <SelectItem value="AS">AS</SelectItem>
                  <SelectItem value="SS">SS</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <Textarea {...form.register("knownAllergies")} placeholder="List any allergies (e.g., Penicillin, Peanuts)..." className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Chronic Conditions</Label>
              <Textarea {...form.register("chronicConditions")} placeholder="E.g., Hypertension, Diabetes, Asthma..." className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea {...form.register("currentMedications")} placeholder="List current medications..." className="h-20" />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-10 gap-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Patient Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
