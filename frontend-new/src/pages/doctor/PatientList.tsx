import { useState, useMemo } from 'react';
import { PatientTable } from '../../components/Doctordashboard/PatientTable';
import { useDoctorQueue } from '../../hooks/useDoctorQueue';
import { Button } from '../../components/ui/form-controls';
import { Input } from '../../components/ui/form-controls';
import { Search, Filter, RefreshCw, Loader2, AlertCircle, Users } from 'lucide-react';
import { type RecordStatus } from '../../services/types/db';

export default function PatientList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');
  const { appointments, isLoading, error, refetch } = useDoctorQueue();

  const filteredPatients = useMemo(() => {
    return appointments.filter(patient => {
      const matchesSearch =
        patient.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.patient.patientIdNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  const statusOptions: { value: RecordStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'updated', label: 'In Progress' },
    { value: 'approved', label: 'Completed' },
  ];

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-foreground">Failed to load patients</p>
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
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      {isLoading && appointments.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">
            {appointments.length === 0 ? 'No patients in queue' : 'No patients match your search'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {appointments.length === 0
              ? 'Patients will appear here when assigned to you'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <PatientTable patients={filteredPatients} compact />
      )}
    </div>
  );
}
