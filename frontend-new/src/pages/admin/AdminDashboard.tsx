import { useEffect, useState } from "react";
import { Building2, Users, CheckCircle, Clock, Loader2, UserPlus, Calendar, ClipboardList, Settings, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";

interface SetupStatus {
  hospitalProfile: boolean;
  staffUploaded: boolean;
  systemStatus: string;
  stats: {
    totalStaff: number;
    totalPatients: number;
    todayAppointments: number;
  };
}

const AdminDashboard = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetupStatus = async () => {
      try {
        const response = await fetch("/api/admin/setup-status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSetupStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch setup status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSetupStatus();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
   
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName || 'Admin'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here's an overview of your healthcare system setup
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Staff
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {setupStatus?.stats?.totalStaff || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Active staff members
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {setupStatus?.stats?.totalPatients || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Registered patients
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Appointments
              </CardTitle>
              <Calendar className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {setupStatus?.stats?.todayAppointments || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Status
              </CardTitle>
              <div className="h-3 w-3 bg-success rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-xl font-semibold text-success">
                  Online
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Status */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Setup Checklist
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={`shadow-card border-l-4 ${setupStatus?.hospitalProfile ? 'border-l-success' : 'border-l-warning'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {setupStatus?.hospitalProfile ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : (
                    <Clock className="h-6 w-6 text-warning" />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">Hospital Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      {setupStatus?.hospitalProfile
                        ? "Completed - Your hospital information is set up"
                        : "Pending - Complete your hospital profile"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`shadow-card border-l-4 ${setupStatus?.staffUploaded ? 'border-l-success' : 'border-l-warning'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {setupStatus?.staffUploaded ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : (
                    <Clock className="h-6 w-6 text-warning" />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">Staff Members</h3>
                    <p className="text-sm text-muted-foreground">
                      {setupStatus?.staffUploaded
                        ? `${setupStatus?.stats?.totalStaff || 0} staff members uploaded`
                        : "Pending - Upload your staff list"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Hospital Profile"
              description="Update hospital information"
              icon={Building2}
              href="/admin/hospital-profile"
            />
            <QuickActionCard
              title="Upload Staff"
              description="Import staff via CSV"
              icon={UserPlus}
              href="/admin/staff/upload-staff"
            />
            <QuickActionCard
              title="View Staff"
              description="Manage staff members"
              icon={Users}
              href="/admin/staff/staff-list"
            />
            <QuickActionCard
              title="Roles & Permissions"
              description="Configure access control"
              icon={Shield}
              href="/admin/roles-permissions"
            />
            <QuickActionCard
              title="System Settings"
              description="Configure system options"
              icon={Settings}
              href="/admin/settings"
            />
            <QuickActionCard
              title="Audit Logs"
              description="View activity history"
              icon={ClipboardList}
              href="/admin/logs"
            />
          </div>
        </div>
      </div>

  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

function QuickActionCard({ title, description, icon: Icon, href }: QuickActionCardProps) {
  return (
    <a
      href={href}
      className="block p-3 sm:p-4 bg-card border border-border rounded-lg shadow-card hover:shadow-soft hover:border-primary/30 transition-all group"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}

export default AdminDashboard;
