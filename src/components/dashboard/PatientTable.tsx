import { Patient } from '../../types/patient'; // Up two levels to src, then into types
import { StatusBadge } from '../ui/data-display'; // Up one level to components, then into ui
import { Button } from '../ui/form-controls'; // Up one level to components, then into ui
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientTableProps {
  patients: Patient[];
  compact?: boolean;
}

export function PatientTable({ patients, compact = false }: PatientTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {!compact && (
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold text-foreground">Assigned Patients</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Patient Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Patient ID
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Last Updated
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Record Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient) => (
              <tr 
                key={patient.id} 
                className="transition-colors hover:bg-muted/20"
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.age} yrs, {patient.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                  {patient.id}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                  {patient.lastUpdated}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <StatusBadge status={patient.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    className="gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    View Record
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
