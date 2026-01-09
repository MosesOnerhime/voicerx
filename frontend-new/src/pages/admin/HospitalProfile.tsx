import { useState } from "react";
import { Building2, Mail, Phone, MapPin, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";

const HospitalProfile = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    hospitalName: "City General Hospital",
    businessEmail: "admin@citygeneral.com",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Healthcare Boulevard, Medical District, NY 10001",
    adminName: "Dr. Sarah Johnson",
    adminEmail: "sarah.johnson@citygeneral.com",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Hospital profile has been saved successfully.",
    });
  };

  return (
 
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your hospital's information and admin details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hospital Information */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Hospital Information</CardTitle>
              </div>
              <CardDescription>
                Basic details about your healthcare facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hospitalName"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter hospital name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="hospital@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 min-h-[80px]"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Admin Information</CardTitle>
              </div>
              <CardDescription>
                Details about the system administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter admin name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="px-8">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
 
  );
};

export default HospitalProfile;
