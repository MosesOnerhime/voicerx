import { useState } from 'react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { PatientTable } from '../../components/Doctordashboard/PatientTable';
import { MOCK_DASHBOARD_DATA } from '../../data/mockData'; // Pointing to your mock data file
import { Button } from '../../components/ui/form-controls';
import { Input } from '../../components/ui/form-controls';
import { Search, Filter } from 'lucide-react';
// Go up one level to src, then into types
import { type RecordStatus } from '../../services/types/db';

export default function PatientList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredPatients = MOCK_DASHBOARD_DATA.filter(patient => {
    const matchesSearch = patient.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || patient.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { value: RecordStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'updated', label: 'Updated' },
    { value: 'approved', label: 'Approved' },
  ];

  return (
    <DoctorLayout 
      title="Patient List" 
      subtitle={`${filteredPatients.length} patients found`}
    >
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
        <PatientTable patients={filteredPatients} compact />
      </div>
    </DoctorLayout>
  );
}
