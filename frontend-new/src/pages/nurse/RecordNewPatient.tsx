'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, ClipboardList, ShieldAlert } from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "../../hooks/use-toast";

// Updated schema to match backend API requirements
const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
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
  
  // Get token from Redux store
  const token = useSelector((state: any) => state.auth.token);
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bloodType: "",
      genotype: "",
      address: "",
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      const response = await fetch("http://localhost:5001/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle duplicate patient case
        if (result.existingPatient) {
          toast({
            variant: "destructive",
            title: "Patient Already Exists",
            description: `${result.existingPatient.firstName} ${result.existingPatient.lastName} (ID: ${result.existingPatient.patientIdNumber}) is already registered with this phone number.`,
          });
        } else {
          throw new Error(result.error || "Failed to create patient record");
        }
        return;
      }

      console.log("Patient created successfully:", result);
      
      toast({
        title: "Success!",
        description: `Patient registered successfully! ID: ${result.patient.patientIdNumber}`,
      });

      form.reset();
      
      // Navigate back to patient list to see the new patient
      setTimeout(() => {
        navigate("/nurse/patients");
      }, 1500);
      
    } catch (error: any) {
      console.error("Registration Error:", error);
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "There was an error saving the patient record.",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            Record New Patient
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input {...form.register("firstName")} placeholder="John" />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input {...form.register("lastName")} placeholder="Doe" />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input type="date" {...form.register("dateOfBirth")} />
              {form.formState.errors.dateOfBirth && (
                <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select onValueChange={(v) => form.setValue("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input {...form.register("phoneNumber")} placeholder="+234..." />
              {form.formState.errors.phoneNumber && (
                <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" {...form.register("email")} placeholder="john.doe@example.com" />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input {...form.register("address")} placeholder="123 Main Street..." />
            </div>
          </div>
        </div>

        {/* Section 2: Medical Info */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Medical Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Select onValueChange={(v) => form.setValue("bloodType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Type" />
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
              <Select onValueChange={(v) => form.setValue("genotype", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Genotype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AA">AA</SelectItem>
                  <SelectItem value="AS">AS</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="SS">SS</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <Textarea {...form.register("knownAllergies")} placeholder="List any allergies..." className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Chronic Conditions</Label>
              <Textarea {...form.register("chronicConditions")} placeholder="E.g. Hypertension, Diabetes..." className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea {...form.register("currentMedications")} placeholder="List current medications..." className="h-20" />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Emergency Contact *
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name *</Label>
              <Input {...form.register("emergencyContactName")} placeholder="Jane Doe" />
              {form.formState.errors.emergencyContactName && (
                <p className="text-xs text-destructive">{form.formState.errors.emergencyContactName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
              <Input {...form.register("emergencyContactPhone")} placeholder="+234..." />
              {form.formState.errors.emergencyContactPhone && (
                <p className="text-xs text-destructive">{form.formState.errors.emergencyContactPhone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
              <Input {...form.register("emergencyContactRelationship")} placeholder="Mother, Spouse, etc." />
              {form.formState.errors.emergencyContactRelationship && (
                <p className="text-xs text-destructive">{form.formState.errors.emergencyContactRelationship.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="px-10 gap-2">
            <Save className="h-4 w-4" />
            {form.formState.isSubmitting ? "Saving..." : "Save Patient Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}