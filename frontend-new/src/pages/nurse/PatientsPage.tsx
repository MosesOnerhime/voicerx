'use client'
import PatientTable from "./PatientTable";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";

export default function NursePatientsPage() {
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Directory of all patients registered in the hospital system.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" />
        </div>
      </div>

      <PatientTable />
    </div>
  );
}