import { useState } from "react";
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
  User, Heart, Thermometer, Activity, Scale, 
  Mic, Square, Loader2, Sparkles, Ruler 
} from "lucide-react";
import { type Appointment } from "../services/types/db";
import { toast } from "../hooks/use-toast";

interface PatientIntakeModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientIntakeModal({ appointment, open, onOpenChange }: PatientIntakeModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State matching your VitalsRecord Schema
  const [formData, setFormData] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    pulse_rate: "",
    temperature: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    weight: "",
    height: "",
    pain_level: "0",
    symptoms_description: ""
  });

  if (!appointment) return null;

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Here you would initialize MediaRecorder API
    } else {
      setIsRecording(false);
      handleProcessVoice();
    }
  };

  const handleProcessVoice = async () => {
    setIsProcessing(true);
    // 1. Send Audio Blob to Backend -> LLM
    // 2. Mocking the AI response delay
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        bp_systolic: "125",
        bp_diastolic: "82",
        pulse_rate: "75",
        temperature: "36.5",
        symptoms_description: "Patient reports mild headache for 2 days and slight dizziness."
      }));
      setIsProcessing(false);
      toast({
        title: "AI Analysis Complete",
        description: "Vitals fields have been auto-filled from your recording.",
      });
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center justify-between">
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Awaiting Intake
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDE: Manual Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Vital Signs
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BP (Systolic/Diastolic)</Label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="120" value={formData.bp_systolic} onChange={(e) => setFormData({...formData, bp_systolic: e.target.value})} />
                    <span>/</span>
                    <Input placeholder="80" value={formData.bp_diastolic} onChange={(e) => setFormData({...formData, bp_diastolic: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pulse (BPM)</Label>
                  <Input placeholder="72" value={formData.pulse_rate} onChange={(e) => setFormData({...formData, pulse_rate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Temp (°C)</Label>
                  <Input placeholder="36.5" value={formData.temperature} onChange={(e) => setFormData({...formData, temperature: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>SpO2 (%)</Label>
                  <Input placeholder="98" value={formData.oxygen_saturation} onChange={(e) => setFormData({...formData, oxygen_saturation: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input placeholder="70" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input placeholder="175" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-2">
                <Label>Chief Complaints / Symptoms</Label>
                <Textarea 
                    placeholder="Describe patient symptoms..." 
                    className="h-24"
                    value={formData.symptoms_description}
                    onChange={(e) => setFormData({...formData, symptoms_description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Voice Recording */}
          <div className="w-[350px] bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <div className="space-y-1">
                    <p className="font-medium">AI is listening...</p>
                    <p className="text-xs text-muted-foreground px-4">Structuring your notes into medical fields</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                <div className={`h-24 w-24 rounded-full mx-auto flex items-center justify-center transition-all ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary/10'}`}>
                    {isRecording ? <Square className="h-8 w-8 text-red-600 fill-red-600" /> : <Mic className="h-8 w-8 text-primary" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{isRecording ? "Recording..." : "Voice Intake"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isRecording 
                      ? "Speak clearly: 'BP is 120 over 80, pulse 72...'" 
                      : "Use AI to fill this form faster by recording a voice summary."}
                  </p>
                </div>

                <Button 
                  size="lg" 
                  variant={isRecording ? "destructive" : "default"} 
                  className="w-full gap-2 shadow-lg"
                  onClick={handleToggleRecording}
                >
                  {isRecording ? "Stop & Process" : "Start Recording"}
                </Button>

                {!isRecording && (
                    <div className="pt-4 flex items-center gap-2 justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" /> Powered by MediFlow AI
                    </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button className="px-8 bg-primary hover:bg-primary/90">Save Record</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}