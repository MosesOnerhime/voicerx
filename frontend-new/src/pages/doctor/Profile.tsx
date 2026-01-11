import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/layout-containers';
import { Button } from '../../components/ui/form-controls';
import { Input } from '../../components/ui/form-controls';
import { Label } from '../../components/ui/form-controls';
import { User, Mail, Phone, Building, Stethoscope, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  return (
    <DoctorLayout 
      title="Profile" 
      subtitle="Manage your account settings"
    >
      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Profile Header */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-healthcare-purple-light text-2xl font-semibold text-healthcare-purple">
                MC
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dr. Michael Chen</h2>
                <p className="text-sm text-muted-foreground">Internal Medicine Physician</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-status-approved-bg px-2.5 py-0.5 text-xs font-medium text-status-approved">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified Provider
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-healthcare-purple" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Michael" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Chen" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" defaultValue="m.chen@healthsync.com" className="pl-9" />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" defaultValue="(555) 123-4567" className="pl-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-healthcare-purple" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" defaultValue="Internal Medicine" className="mt-1.5" readOnly />
              </div>
              <div>
                <Label htmlFor="license">License Number</Label>
                <Input id="license" defaultValue="MD-2024-78432" className="mt-1.5" readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <div className="relative mt-1.5">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="department" defaultValue="General Practice" className="pl-9" readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="startDate" defaultValue="January 15, 2020" className="pl-9" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </DoctorLayout>
  );
}
