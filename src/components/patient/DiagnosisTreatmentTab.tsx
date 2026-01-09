import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Up two levels: patient -> components -> src, then into types
import { DiagnosisTreatment, RecordStatus } from '../../types/patient';
// Up one level: patient -> components, then into ui
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout-containers';
import { Button } from '../ui/form-controls';
import { Textarea } from '../ui/form-controls';
import { Label } from '../ui/form-controls';
import { Input } from '../ui/form-controls';
import { Stethoscope, Pill, FileText, Plus, X, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosisTreatmentTabProps {
  patientId: string;
  diagnosisTreatment: DiagnosisTreatment;
  patientStatus: RecordStatus;
}

export function DiagnosisTreatmentTab({ 
  patientId, 
  diagnosisTreatment, 
  patientStatus 
}: DiagnosisTreatmentTabProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diagnosis: diagnosisTreatment.diagnosis,
    treatmentPlan: diagnosisTreatment.treatmentPlan,
    prescriptions: diagnosisTreatment.prescriptions,
    doctorNotes: diagnosisTreatment.doctorNotes,
  });
  const [newPrescription, setNewPrescription] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const isApproved = patientStatus === 'approved';

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addPrescription = () => {
    if (newPrescription.trim()) {
      setFormData(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, newPrescription.trim()]
      }));
      setNewPrescription('');
      setHasChanges(true);
    }
  };

  const removePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Updates saved successfully');
    setHasChanges(false);
    // Navigate to review screen
    navigate(`/patient/${patientId}/review`, { state: { formData } });
  };

  const handleCancel = () => {
    setFormData({
      diagnosis: diagnosisTreatment.diagnosis,
      treatmentPlan: diagnosisTreatment.treatmentPlan,
      prescriptions: diagnosisTreatment.prescriptions,
      doctorNotes: diagnosisTreatment.doctorNotes,
    });
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  if (isApproved) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card border-status-approved/20 bg-status-approved-bg/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-status-approved/10 p-2">
                <Stethoscope className="h-5 w-5 text-status-approved" />
              </div>
              <div>
                <p className="font-medium text-foreground">Record Approved</p>
                <p className="text-sm text-muted-foreground">
                  This medical record has been approved and is read-only.
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

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.prescriptions.length > 0 ? (
                <ul className="space-y-2">
                  {formData.prescriptions.map((rx, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Pill className="h-4 w-4 mt-0.5 text-healthcare-purple" />
                      {rx}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No prescriptions</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
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
    <div className="space-y-6">
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
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-4 w-4 text-healthcare-purple" />
            Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.prescriptions.length > 0 && (
            <ul className="space-y-2">
              {formData.prescriptions.map((rx, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <span className="text-sm">{rx}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removePrescription(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add prescription (e.g., Medication 500mg - dosage instructions)"
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPrescription()}
            />
            <Button variant="outline" onClick={addPrescription}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
      <div className="flex justify-end gap-3 pt-2">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={!hasChanges}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Cancel Changes
        </Button>
        <Button 
          onClick={handleSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Updates
        </Button>
      </div>
    </div>
  );
}
