import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { PageHeader } from "../../components/ui/PageHeader";

interface ValidationError {
  row: number;
  message: string;
}

interface StaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialization?: string;
}

// Parse CSV file content
const parseCSV = (content: string): StaffData[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  // Get headers and normalize them
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Map header names to expected fields
  const headerMap: Record<string, string> = {
    'first_name': 'firstName',
    'firstname': 'firstName',
    'first name': 'firstName',
    'last_name': 'lastName',
    'lastname': 'lastName',
    'last name': 'lastName',
    'email': 'email',
    'phone': 'phone',
    'role': 'role',
    'specialization': 'specialization',
  };

  const staffData: StaffData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
    const staff: Record<string, string> = {};

    headers.forEach((header, index) => {
      const fieldName = headerMap[header] || header;
      if (values[index]) {
        staff[fieldName] = values[index];
      }
    });

    // Normalize role to uppercase
    if (staff.role) {
      staff.role = staff.role.toUpperCase();
      // Handle common role variations
      if (staff.role === 'DR' || staff.role === 'DOC') staff.role = 'DOCTOR';
      if (staff.role === 'RN') staff.role = 'NURSE';
      if (staff.role === 'PHARM') staff.role = 'PHARMACIST';
    }

    staffData.push(staff as unknown as StaffData);
  }

  return staffData;
};

const UploadStaff = () => {
  const { toast } = useToast();
  const token = useSelector((state: RootState) => state.auth.token);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [createdCount, setCreatedCount] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))) {
      setFile(droppedFile);
      setValidationErrors([]);
      setUploadSuccess(false);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV or XLSX file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setValidationErrors([]);
    setUploadSuccess(false);

    try {
      // Read and parse the CSV file
      const content = await file.text();
      const staffData = parseCSV(content);

      if (staffData.length === 0) {
        toast({
          title: "No Data Found",
          description: "The file appears to be empty or has no valid data rows.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Call the backend API
      const response = await fetch('http://localhost:5001/api/users/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ staffData }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.validationErrors) {
          setValidationErrors(
            result.validationErrors.map((e: { row: number; error: string }) => ({
              row: e.row,
              message: e.error,
            }))
          );
        } else if (result.existingEmails) {
          setValidationErrors(
            result.existingEmails.map((email: string, i: number) => ({
              row: i + 1,
              message: `Email already exists: ${email}`,
            }))
          );
        } else if (result.duplicates) {
          setValidationErrors(
            result.duplicates.map((email: string, i: number) => ({
              row: i + 1,
              message: `Duplicate email in file: ${email}`,
            }))
          );
        } else {
          toast({
            title: "Upload Failed",
            description: result.error || "An error occurred during upload.",
            variant: "destructive",
          });
        }
        setIsUploading(false);
        return;
      }

      // Success
      setCreatedCount(result.created?.length || 0);
      setUploadSuccess(true);
      toast({
        title: "Staff Uploaded Successfully",
        description: `${result.created?.length || 0} staff members created. Temporary password: ${result.tempPassword}`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload staff. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
    setValidationErrors([]);
  };

  return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader
          title="Upload Staff"
          description="Import staff members from a CSV or Excel file"
          breadcrumbs={[
            { label: "Staff Management", href: "/admin/staff/staff-list" },
            { label: "Upload Staff" },
          ]}
          backHref="/admin/dashboard"
        />

        {/* Upload Card */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Upload Staff File</CardTitle>
            </div>
            <CardDescription>
              Upload a CSV or XLSX file containing staff information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
                ${file ? "border-success bg-success/5" : ""}
              `}
            >
              {file ? (
                <div className="space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-success" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Required Columns */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">Required Columns</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">first_name</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">last_name</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">email</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">phone</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">role</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">specialization*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-muted-foreground">
                      <td className="py-2 px-3">John</td>
                      <td className="py-2 px-3">Doe</td>
                      <td className="py-2 px-3">john@example.com</td>
                      <td className="py-2 px-3">+1234567890</td>
                      <td className="py-2 px-3">Doctor</td>
                      <td className="py-2 px-3">Cardiology</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Specialization is required for Doctors only. Valid roles: Doctor, Nurse, Pharmacist
              </p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <h4 className="font-medium">Validation Errors</h4>
                </div>
                <ul className="space-y-1 text-sm text-destructive">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <h4 className="font-medium">Upload Successful</h4>
                </div>
                <p className="text-sm text-success mt-1">
                  Successfully created {createdCount} staff member{createdCount !== 1 ? 's' : ''}.
                  Temporary password: <strong>Welcome@123</strong>
                </p>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                size="lg"
                className="px-8"
              >
                {isUploading ? "Uploading..." : "Upload Staff"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default UploadStaff;
