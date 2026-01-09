import { useState } from 'react';
import { DoctorLayout } from '../components/layout/DoctorLayout';
import { Card, CardContent } from '../components/ui/layout-containers';
import { Input } from '../components/ui/form-controls';
import { Button } from '../components/ui/form-controls';
import { StatusBadge } from '../components/ui/data-display';
import { mockPatients } from '../data/mockData'; // Fixed to standard filename
import { Search, Filter, FileText, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Records() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DoctorLayout 
      title="Medical Records" 
      subtitle="View and manage patient records"
    >
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
          <Button variant="outline" size="sm" className="gap-2 self-start">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Records Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((patient) => (
            <Card 
              key={patient.id} 
              className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
              onClick={() => navigate(`/patient/${patient.id}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-healthcare-purple-light">
                      <FileText className="h-5 w-5 text-healthcare-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{patient.id}</p>
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

        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No records found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
