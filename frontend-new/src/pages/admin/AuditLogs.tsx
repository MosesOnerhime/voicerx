import { useState } from "react";
import { FileText, Search, Filter, Calendar } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: "Success" | "Failed";
  ipAddress: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2025-01-09 14:32:15",
    user: "Dr. Sarah Johnson",
    action: "Login",
    resource: "Authentication",
    status: "Success",
    ipAddress: "192.168.1.105",
  },
  {
    id: "2",
    timestamp: "2025-01-09 14:28:42",
    user: "Admin",
    action: "Update Profile",
    resource: "Hospital Profile",
    status: "Success",
    ipAddress: "192.168.1.100",
  },
  {
    id: "3",
    timestamp: "2025-01-09 14:15:33",
    user: "Michael Chen",
    action: "Upload Staff",
    resource: "Staff Management",
    status: "Success",
    ipAddress: "192.168.1.110",
  },
  {
    id: "4",
    timestamp: "2025-01-09 13:58:21",
    user: "Unknown",
    action: "Login Attempt",
    resource: "Authentication",
    status: "Failed",
    ipAddress: "203.45.67.89",
  },
  {
    id: "5",
    timestamp: "2025-01-09 13:45:10",
    user: "Admin",
    action: "Create Role",
    resource: "Roles & Permissions",
    status: "Success",
    ipAddress: "192.168.1.100",
  },
  {
    id: "6",
    timestamp: "2025-01-09 12:30:55",
    user: "Emily Davis",
    action: "View Patient Record",
    resource: "Patient Records",
    status: "Success",
    ipAddress: "192.168.1.115",
  },
];

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
  
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track and monitor all system activities
          </p>
        </div>

        {/* Logs Card */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Activity Log</CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Button>
              </div>
            </div>
            <CardDescription>
              {filteredLogs.length} log entries found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.resource}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === "Success"
                              ? "bg-success/15 text-success border-success/30"
                              : "bg-destructive/15 text-destructive border-destructive/30"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {log.ipAddress}
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

export default AuditLogs;
