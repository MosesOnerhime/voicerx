import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/layout-containers';
import { Button } from '../../components/ui/form-controls';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/overlays-and-feedback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/overlays-and-feedback';
import { MOCK_DASHBOARD_DATA } from '../../data/mockData';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Stethoscope, 
  FileText, 
  Pill,
  Edit,
  ShieldCheck
} from 'lucide-react';

export default function ReviewApproval() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const record = patientId ? MOCK_DASHBOARD_DATA[patientId] : null;
  const formData = location.state?.formData || record?.diagnosisTreatment;

  if (!record) {
    return (
      <DoctorLayout title="Patient Not Found">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Patient record not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/doctor/patients')}>
            Back to Patients
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  const { patient } = record;

  const handleApprove = () => {
    setShowConfirmDialog(false);
    setIsApproved(true);
  };

  if (isApproved) {
    return (
      <DoctorLayout 
        title="Record Approved" 
        subtitle={patient.name}
      >
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Success Banner */}
          <Alert className="border-status-approved bg-status-approved-bg">
            <CheckCircle className="h-5 w-5 text-status-approved" />
            <AlertTitle className="text-status-approved font-semibold">
              Medical record approved successfully
            </AlertTitle>
            <AlertDescription className="text-status-approved/80">
              The patient's medical record has been finalized and is now part of their permanent health record.
            </AlertDescription>
          </Alert>

          {/* Approval Details */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-approved-bg">
                  <ShieldCheck className="h-6 w-6 text-status-approved" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Approval Confirmed</h3>
                    <p className="text-sm text-muted-foreground">Record status changed to Approved</p>
                  </div>
                  
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Patient Name</span>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Patient ID</span>
                      <span className="font-medium font-mono">{patient.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Approved By</span>
                      <span className="font-medium">Dr. Michael Chen</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Timestamp</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/doctor/patients')}>
              Back to Patient List
            </Button>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout 
      title="Review & Approval" 
      subtitle={patient.name}
    >
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/doctor/patient/${patientId}`)}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Record
        </Button>

        {/* Warning Banner */}
        <Alert className="border-status-updated/30 bg-status-updated-bg">
          <AlertTriangle className="h-5 w-5 text-status-updated" />
          <AlertTitle className="text-status-updated font-semibold">
            Review Before Approval
          </AlertTitle>
          <AlertDescription className="text-status-updated/80">
            Please carefully review all information below. Once approved, this record becomes part of the patient's permanent medical history.
          </AlertDescription>
        </Alert>

        {/* Patient Info */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{patient.name}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="mt-1 font-medium font-mono">{patient.id}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Visit Date</p>
                <p className="mt-1 font-medium">{patient.visitDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Summary */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-healthcare-purple" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formData?.diagnosis || 'Not specified'}</p>
          </CardContent>
        </Card>

        {/* Treatment Plan Summary */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-healthcare-purple" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formData?.treatmentPlan || 'Not specified'}</p>
          </CardContent>
        </Card>

        {/* Prescriptions Summary */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-healthcare-purple" />
              Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData?.prescriptions?.length > 0 ? (
              <ul className="space-y-2">
                {formData.prescriptions.map((rx: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-healthcare-purple flex-shrink-0" />
                    {rx}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No prescriptions</p>
            )}
          </CardContent>
        </Card>

        {/* Doctor Notes Summary */}
        {formData?.doctorNotes && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-healthcare-purple" />
            Additional Notes
          </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formData.doctorNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Question */}
        <Card className="shadow-card border-primary/20 bg-healthcare-blue-light/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-medium text-foreground">Is the information accurate?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please confirm that all diagnosis, treatment, and prescription information is correct.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-2">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate(`/doctor/patient/${patientId}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Record
          </Button>
          <Button 
            size="lg"
            onClick={() => setShowConfirmDialog(true)}
            className="gap-2 bg-status-approved hover:bg-status-approved/90"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Medical Record
          </Button>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Approval</DialogTitle>
              <DialogDescription>
                You are about to approve the medical record for <strong>{patient.name}</strong>. 
                This action will finalize the record and make it part of the patient's permanent medical history.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                className="bg-status-approved hover:bg-status-approved/90"
              >
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  );
}
