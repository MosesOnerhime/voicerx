'use client'
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { ArrowLeft, Edit2, Save, X, Phone, User, Droplets, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "../../hooks/use-toast";

interface PatientData {
  id: string;
  patientIdNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
  bloodType: string | null;
  genotype: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  knownAllergies: string | null;
  chronicConditions: string | null;
  currentMedications: string | null;
  age?: number;
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [formData, setFormData] = useState<PatientData | null>(null);
  const [originalData, setOriginalData] = useState<PatientData | null>(null);

  // Fetch patient data on mount
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch patient");
        }

        const data = await response.json();
        setFormData(data.patient);
        setOriginalData(data.patient);
      } catch (error) {
        console.error("Fetch patient error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load patient data",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchPatient();
    }
  }, [token, id]);

  const handleInputChange = (field: keyof PatientData, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing - restore original data
      setFormData(originalData);
    }
    setIsEditing(!isEditing);
    setSearchParams(isEditing ? {} : { edit: "true" });
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          bloodType: formData.bloodType,
          genotype: formData.genotype,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          knownAllergies: formData.knownAllergies,
          chronicConditions: formData.chronicConditions,
          currentMedications: formData.currentMedications,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update patient");
      }

      const data = await response.json();
      setOriginalData(data.patient);
      setFormData(data.patient);
      setIsEditing(false);
      setSearchParams({});

      toast({
        title: "Success",
        description: "Patient profile updated successfully",
      });
    } catch (error) {
      console.error("Update patient error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update patient",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Patient Not Found</h2>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6 animate-fade-in">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleToggleEdit} disabled={saving} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleToggleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* 2. Patient Hero Card */}
      <Card className="bg-primary/5 border-none shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {formData.firstName[0]}{formData.lastName[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {formData.firstName} {formData.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
                <Badge variant="outline" className="text-sm">{formData.patientIdNumber}</Badge>
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {formData.gender} {formData.age && `(${formData.age} yrs)`}</span>
                <span className="flex items-center gap-1"><Droplets className="h-4 w-4 text-red-500" /> {formData.bloodType || 'N/A'} / {formData.genotype || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 3. Essential Info (Left Column) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  disabled={!isEditing}
                  value={formatDate(formData.dateOfBirth)}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Email Address</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Home Address</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" /> Known Allergies</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.knownAllergies || ''}
                  placeholder="None recorded"
                  onChange={(e) => handleInputChange('knownAllergies', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.chronicConditions || ''}
                  onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.currentMedications || ''}
                  onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Sidebar Stats (Right Column) */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-amber-600"><Phone className="h-4 w-4" /> Emergency Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Vital Stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Genotype</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.genotype || ''}
                  onChange={(e) => handleInputChange('genotype', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}