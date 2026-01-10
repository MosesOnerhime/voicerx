import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";

interface ValidationError {
  row: number;
  message: string;
}

const UploadStaff = () => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

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

    // Simulate upload and validation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock validation - in real app, this would come from backend
    const mockErrors: ValidationError[] = [];
    
    if (mockErrors.length > 0) {
      setValidationErrors(mockErrors);
      setIsUploading(false);
      return;
    }

    setUploadSuccess(true);
    setIsUploading(false);
    toast({
      title: "Staff Uploaded Successfully",
      description: "Invitation emails with temporary passwords have been sent to all staff members.",
    });
  };

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
    setValidationErrors([]);
  };

  return (

      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Staff</h1>
          <p className="text-muted-foreground mt-1">
            Import staff members from a CSV or Excel file
          </p>
        </div>

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
                  Invitation emails with temporary passwords have been sent to all staff members.
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
