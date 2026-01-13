// components/PrescriptionTable.tsx
"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pill, Clock, CheckCircle2, Search, X, User, Stethoscope, AlertCircle } from "lucide-react";
import type { Prescription, Priority, Status } from "../services/types/db"; 

interface TableProps {
  statusFilter: "pending" | "dispensed" | "all";
  title: string;
}

export default function PrescriptionTable({ statusFilter, title }: TableProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // 1. Fetching Logic
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ["prescriptions", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/prescriptions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Backend returns { prescriptions: [...], pagination: {...} }
      return data.prescriptions || [];
    },
  });

  // 2. Mutation Logic
  const dispenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispensed" }),
      });
      if (!res.ok) throw new Error("Failed to dispense");
    },
    onSuccess: () => {
      // Refresh both the list and the global stats
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription-stats"] });
      setSelectedPrescription(null);
    },
  });

  const handleDispense = useCallback((id: number) => {
    if (confirm("Are you sure you want to mark this as dispensed?")) {
      dispenseMutation.mutate(id);
    }
  }, [dispenseMutation]);

  // 3. UI Helpers
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "EMERGENCY": return "bg-red-100 text-red-800 border-red-200";
      case "URGENT": return "bg-amber-100 text-amber-800 border-amber-200";
      case "NORMAL": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: Status) => {
    return status === "dispensed"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by patient, ID, or doctor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Patient</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Doctor</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Issued</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
            ) : prescriptions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No prescriptions found.</td></tr>
            ) : (
              prescriptions.map((prescription) => (
                <tr 
                  key={prescription.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="text-purple-600" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{prescription.patientName}</div>
                        <div className="text-xs text-gray-500">{prescription.patient_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-gray-400" />
                      {prescription.prescribedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(prescription.priority)}`}>
                      {prescription.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(prescription.status)}`}>
                      {prescription.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{formatDate(prescription.dateIssued)}</td>
                  <td className="px-6 py-4 text-right">
                    {prescription.status === "pending" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDispense(Number(prescription.id)); }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition-colors"
                      >
                        Dispense
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Reusing your existing logic */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Prescription Details</h3>
              <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="p-6">
              {/* Patient Info Section */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Patient</p>
                <p className="font-bold text-lg">{selectedPrescription.patientName}</p>
                <p className="text-sm text-gray-600">ID: {selectedPrescription.patient_id}</p>
              </div>

              {/* Medications List */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Medications</p>
                <div className="space-y-3">
                  {selectedPrescription.medications?.map((med, idx) => (
                    <div key={idx} className="border p-4 rounded-lg flex gap-4">
                      <div className="bg-blue-50 p-2 rounded-lg h-fit"><Pill className="text-blue-600" size={20} /></div>
                      <div>
                        <p className="font-bold">{med.medicationName}</p>
                        <p className="text-sm text-gray-600">{med.dosage} — {med.quantity}</p>
                        {med.instructions && <p className="mt-2 text-sm bg-blue-50 p-2 rounded text-blue-800">{med.instructions}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              {selectedPrescription.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => handleDispense(Number(selectedPrescription.id))}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Mark as Dispensed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}