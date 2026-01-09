import { useState } from "react";
import { Users, Eye, Ban, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
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

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Doctor" | "Nurse" | "Pharmacist";
  status: "Invited" | "Active";
  specialization?: string;
  phone: string;
}

const mockStaff: StaffMember[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    role: "Doctor",
    status: "Active",
    specialization: "Cardiology",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@hospital.com",
    role: "Doctor",
    status: "Active",
    specialization: "Neurology",
    phone: "+1 (555) 234-5678",
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@hospital.com",
    role: "Nurse",
    status: "Active",
    phone: "+1 (555) 345-6789",
  },
  {
    id: "4",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@hospital.com",
    role: "Pharmacist",
    status: "Invited",
    phone: "+1 (555) 456-7890",
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@hospital.com",
    role: "Nurse",
    status: "Invited",
    phone: "+1 (555) 567-8901",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staff] = useState<StaffMember[]>(mockStaff);

  const filteredStaff = staff.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff List</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all staff members
            </p>
          </div>
          <Button asChild>
            <a href="/staff/upload">Add Staff</a>
          </Button>
        </div>

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
