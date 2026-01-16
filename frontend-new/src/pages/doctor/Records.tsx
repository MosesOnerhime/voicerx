import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/layout-containers';
import { Input } from '../../components/ui/form-controls';
import { Button } from '../../components/ui/form-controls';
import { StatusBadge } from '../../components/ui/data-display';
import { useDoctorQueue } from '../../hooks/useDoctorQueue';
import { Search, Filter, FileText, Calendar, Eye, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Records() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { appointments, isLoading, error, refetch } = useDoctorQueue();

  const filteredRecords = useMemo(() => {
    return appointments.filter(patient =>
      patient.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.patient.patientIdNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-foreground">Failed to load records</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button onClick={() => refetch()} className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search records by patient name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2 self-start">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Records Grid */}
      {isLoading && appointments.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((patient) => (
            <Card
              key={patient.appointmentId}
              className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
              onClick={() => navigate(`/doctor/patient/${patient.appointmentId}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-healthcare-purple-light">
                      <FileText className="h-5 w-5 text-healthcare-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {patient.patient.firstName} {patient.patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {patient.patient.patientIdNumber || patient.patient.id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={patient.status} />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {patient.visitDate}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 h-8">
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {appointments.length === 0 ? 'No records found' : 'No records match your search'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {appointments.length === 0
              ? 'Patient records will appear here when assigned to you'
              : 'Try adjusting your search criteria'}
          </p>
        </div>
      )}
    </div>
  );
}
