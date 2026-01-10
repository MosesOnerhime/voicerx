import { useEffect, useState } from "react";
import { Building2, Users, CheckCircle, Clock, Loader2 } from "lucide-react";
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
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName || 'Admin'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your healthcare system setup
          </p>
        </div>

        {/* Setup Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hospital Profile
              </CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {setupStatus?.hospitalProfile ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-lg font-semibold text-success">
                      Completed
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="text-lg font-semibold text-warning">
                      Pending
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {setupStatus?.hospitalProfile
                  ? "Your hospital information is complete"
                  : "Complete your hospital profile to continue"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff Uploaded
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {setupStatus?.staffUploaded ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-lg font-semibold text-success">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="text-lg font-semibold text-warning">
                      No
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {setupStatus?.staffUploaded
                  ? "Staff members have been imported"
                  : "Upload your staff list to get started"}
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
                <span className="text-lg font-semibold text-success">
                  Operational
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                All systems running normally
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Complete Profile"
              description="Update hospital information"
              icon={Building2}
              href="/hospital-profile"
            />
            <QuickActionCard
              title="Upload Staff"
              description="Import staff via CSV"
              icon={Users}
              href="/staff/upload"
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
      className="block p-4 bg-card border border-border rounded-lg shadow-card hover:shadow-soft hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </a>
  );
}

export default AdminDashboard;
