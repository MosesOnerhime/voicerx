"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import PrescriptionTable from "../../components/PrescriptionTable"; 

export default function PharmacyDashboard() {
  // We keep the stats fetch here because the Dashboard is the only place that shows them
  const { data: stats } = useQuery({
    queryKey: ["prescription-stats"],
    queryFn: async () => {
      const response = await fetch("/api/prescriptions/stats");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json();
    },
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header & Stats Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pharmacy Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Pending" value={stats?.pending} color="yellow" Icon={Clock} />
            <StatCard title="Dispensed" value={stats?.dispensed} color="green" Icon={CheckCircle2} />
            <StatCard title="High Priority" value={stats?.highPriority} color="red" Icon={AlertCircle} />
            <StatCard title="Today" value={stats?.dispensedToday} color="blue" Icon={Calendar} />
          </div>
        </div>

        {/* The Reusable Table Component set to "all" */}
        <div className="flex-1 overflow-auto">
           <PrescriptionTable statusFilter="all" title="All Prescriptions" />
        </div>
      </div>
    </div>
  );
}

// Simple internal helper for the stat cards
function StatCard({ title, value, color, Icon }: any) {
  const colors: any = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value || 0}</p>
        </div>
        <Icon size={32} className="opacity-50" />
      </div>
    </div>
  );
}