'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, ClipboardList, ShieldAlert } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "../../hooks/use-toast";

// 1. Validation Schema
const patientSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  phone_number: z.string().min(10, "Valid phone number is required"),
  emergency_contact: z.string().min(10, "Emergency contact is required"),
  // Optional Fields
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  blood_type: z.string().optional(),
  genotype: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  medications: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function RecordNewPatient() {
  const navigate = useNavigate();
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: "",
      email: "",
      blood_type: "",
      genotype: "",
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      // Logic: await patientApi.create(data);
      console.log("Saving Patient:", data);
      
      toast({
        title: "Success!",
        description: "Patient record has been created successfully.",
      });

      form.reset(); // Clear fields on success
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error saving the patient record.",
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
              <Label htmlFor="full_name">Full Name *</Label>
              <Input {...form.register("full_name")} placeholder="John Doe" />
              {form.formState.errors.full_name && <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input type="date" {...form.register("date_of_birth")} />
              {form.formState.errors.date_of_birth && <p className="text-xs text-destructive">{form.formState.errors.date_of_birth.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select onValueChange={(v) => form.setValue("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input {...form.register("phone_number")} placeholder="+234..." />
            </div>
          </div>
        </div>

        {/* Section 2: Medical Info (Mixed Required/Optional) */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Medical Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Input {...form.register("blood_type")} placeholder="O+" />
            </div>
            <div className="space-y-2">
              <Label>Genotype</Label>
              <Input {...form.register("genotype")} placeholder="AA" />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Emergency Contact *</Label>
              <Input {...form.register("emergency_contact")} placeholder="Name & Phone" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <Textarea {...form.register("allergies")} placeholder="List any allergies..." className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Chronic Conditions & Medications</Label>
              <Textarea {...form.register("chronic_conditions")} placeholder="E.g. Hypertension, Diabetes..." className="h-20" />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="px-10 gap-2">
            <Save className="h-4 w-4" />
            Save Patient Record
          </Button>
        </div>
      </form>
    </div>
  );
}