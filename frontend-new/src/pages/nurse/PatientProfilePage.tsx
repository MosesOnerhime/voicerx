'use client'
import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Phone, User, Droplets, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
//import { Badge } from "../../components/ui/badge";
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export default function PatientProfilePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State to toggle Edit Mode
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");

  // Mock Initial Data (Replace with your API fetch)
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    dob: "1990-05-15",
    gender: "Male",
    phone: "+234 801 234 5678",
    emergencyContact: "Jane Doe (+234 802 000 0000)",
    email: "john.doe@example.com",
    address: "123 Medical Lane, Lagos",
    bloodType: "O+",
    genotype: "AA",
    allergies: "Penicillin, Peanuts",
    chronicConditions: "Hypertension",
    medications: "Amlodipine 5mg"
  });

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setSearchParams(isEditing ? {} : { edit: "true" });
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
              <Button variant="outline" onClick={handleToggleEdit} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleToggleEdit} className="bg-green-600 hover:bg-green-700 gap-2">
                <Save className="h-4 w-4" /> Save Changes
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
              <div className="flex gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {formData.gender}</span>
                <span className="flex items-center gap-1"><Droplets className="h-4 w-4 text-red-500" /> {formData.bloodType} / {formData.genotype}</span>
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
                <Input disabled={!isEditing} value={formData.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input disabled={!isEditing} value={formData.lastName} />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input type="date" disabled={!isEditing} value={formData.dob} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input disabled={!isEditing} value={formData.phone} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Email Address</Label>
                <Input disabled={!isEditing} value={formData.email} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Home Address</Label>
                <Input disabled={!isEditing} value={formData.address} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" /> Known Allergies</Label>
                <Input disabled={!isEditing} value={formData.allergies} placeholder="None recorded" />
              </div>
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <Input disabled={!isEditing} value={formData.chronicConditions} />
              </div>
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Input disabled={!isEditing} value={formData.medications} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Sidebar Stats (Right Column) */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-amber-600"><Phone className="h-4 w-4" /> Emergency Contact</CardTitle></CardHeader>
            <CardContent>
              <Input disabled={!isEditing} value={formData.emergencyContact} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Vital Stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Input disabled={!isEditing} value={formData.bloodType} />
              </div>
              <div className="space-y-2">
                <Label>Genotype</Label>
                <Input disabled={!isEditing} value={formData.genotype} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}