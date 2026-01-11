import { useState, useEffect } from "react";
import { Users, Eye, Ban, Search, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Doctor" | "Nurse" | "Pharmacist" | "Admin";
  status: "Invited" | "Active" | "Inactive";
  specialization?: string;
  phone: string;
}

const getRoleBadgeVariant = (role: StaffMember["role"]) => {
  switch (role) {
    case "Doctor":
      return "bg-primary/15 text-primary border-primary/30";
    case "Nurse":
      return "bg-success/15 text-success border-success/30";
    case "Pharmacist":
      return "bg-warning/15 text-warning border-warning/30";
  }
};

const getStatusBadgeVariant = (status: StaffMember["status"]) => {
  switch (status) {
    case "Active":
      return "bg-success/15 text-success border-success/30";
    case "Invited":
      return "bg-muted text-muted-foreground border-border";
  }
};

const StaffList = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);

        const response = await fetch(`/api/admin/staff?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStaff(data.staff || []);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStaff();
    }
  }, [token, searchQuery]);

  const handleDisable = async (id: string) => {
    if (!confirm("Are you sure you want to disable this staff member?")) return;

    try {
      const response = await fetch(`/api/admin/staff?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setStaff(staff.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to disable staff:", error);
    }
  };

  const filteredStaff = staff;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <PageHeader
          title="Staff List"
          description="Manage and view all staff members"
          breadcrumbs={[
            { label: "Staff Management" },
          ]}
          backHref="/admin/dashboard"
          actions={
            <Button asChild>
              <Link to="/admin/staff/upload-staff" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Staff
              </Link>
            </Button>
          }
        />

        {/* Staff Table Card */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>All Staff Members</CardTitle>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <CardDescription>
              {filteredStaff.length} staff members found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRoleBadgeVariant(member.role)}
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeVariant(member.status)}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStaff(member)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDisable(member.id)}
                          >
                            <Ban className="h-4 w-4" />
                            Disable
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Staff Dialog */}
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Staff Details</DialogTitle>
              <DialogDescription>
                View detailed information about this staff member
              </DialogDescription>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedStaff.firstName} {selectedStaff.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeVariant(selectedStaff.role)}
                    >
                      {selectedStaff.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeVariant(selectedStaff.status)}
                    >
                      {selectedStaff.status}
                    </Badge>
                  </div>
                  {selectedStaff.specialization && (
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{selectedStaff.specialization}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default StaffList;
