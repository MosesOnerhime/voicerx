import { useEffect, useState } from "react";

import { Building2, Mail, Phone, MapPin, User, Hospital } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/RootState";
import axios from "axios";

const HospitalProfile = () => {
  const { toast } = useToast();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: "",
    businessEmail: "",
    phoneNumber: "",
    address: "",
    adminName: "",
    adminEmail: "",
  });

  // 1. Fetch current profile data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        hospitalName: user.hospitalId.name || "",
        businessEmail: user.hospitalId.email || "", // Official hospital email
        phoneNumber: user.phone || "",
        address: user.hospitalId.address || "",
        adminName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        adminEmail: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        hospitalName: formData.hospitalName,
        email: formData.businessEmail,
        phone: formData.phoneNumber,
        address: formData.address,
        adminEmail: formData.adminEmail,
      };

      // Ensure you pass the Authorization header
      await axios.put(`${API_URL}/hospital/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Profile Updated",
        description: "Your hospital information has been saved successfully.",
        className: "bg-green-600 text-white"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast({
        variant: "destructive",
        title: "Update Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
