import { Shield, Users, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: ["All Permissions"],
    userCount: 2,
  },
  {
    id: "2",
    name: "Doctor",
    description: "Access to patient records and medical functions",
    permissions: ["View Patients", "Edit Medical Records", "Prescribe Medications"],
    userCount: 12,
  },
  {
    id: "3",
    name: "Nurse",
    description: "Access to patient care and monitoring",
    permissions: ["View Patients", "Update Vitals", "Administer Medications"],
    userCount: 25,
  },
  {
    id: "4",
    name: "Pharmacist",
    description: "Manage medications and prescriptions",
    permissions: ["View Prescriptions", "Dispense Medications", "Manage Inventory"],
    userCount: 5,
  },
];

const RolesPermissions = () => {
    
  return (
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Manage user roles and their permissions"
          breadcrumbs={[{ label: "Roles & Permissions" }]}
          backHref="/admin/dashboard"
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          }
        />

        {/* Roles Card */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>System Roles</CardTitle>
            </div>
            <CardDescription>
              Define roles and assign permissions to control access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs bg-accent/50"
                            >
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.userCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
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
      </div>
   
  );
};

export default RolesPermissions;
