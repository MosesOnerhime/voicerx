"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Calendar,
  User,
  Stethoscope,
  FileText,
} from "lucide-react";

export default function PharmacyDashboard() {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["prescription-stats"],
    queryFn: async () => {
      const response = await fetch("/api/prescriptions/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return response.json();
    },
  });

  // Fetch prescriptions
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/prescriptions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
      return response.json();
    },
  });

  // Dispense prescription mutation
  const dispenseMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispensed" }),
      });
      if (!response.ok) {
        throw new Error("Failed to dispense prescription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription-stats"] });
      setSelectedPrescription(null);
    },
  });

  const handleDispense = useCallback(
    (id) => {
      if (
        confirm("Are you sure you want to mark this prescription as dispensed?")
      ) {
        dispenseMutation.mutate(id);
      }
    },
    [dispenseMutation],
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    return status === "dispensed"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
    

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prescription Management
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {stats?.pending || 0}
                  </p>
                </div>
                <Clock className="text-yellow-600" size={32} />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Dispensed
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats?.dispensed || 0}
                  </p>
                </div>
                <CheckCircle2 className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    High Priority
                  </p>
                  <p className="text-3xl font-bold text-red-900">
                    {stats?.highPriority || 0}
                  </p>
                </div>
                <AlertCircle className="text-red-600" size={32} />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Today</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats?.dispensedToday || 0}
                  </p>
                </div>
                <Calendar className="text-blue-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Queue */}
        <div className="flex-1 overflow-auto p-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by patient name, ID, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Prescriptions Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date Issued
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading prescriptions...
                    </td>
                  </tr>
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No prescriptions found
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((prescription) => (
                    <tr
                      key={prescription.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {prescription.patient_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prescription.patient_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="text-gray-400" size={16} />
                          <span className="text-gray-900">
                            {prescription.prescribing_doctor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(prescription.priority)}`}
                        >
                          {prescription.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(prescription.status)}`}
                        >
                          {prescription.status === "dispensed"
                            ? "Dispensed"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(prescription.date_issued)}
                      </td>
                      <td className="px-6 py-4">
                        {prescription.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDispense(prescription.id);
                            }}
                            disabled={dispenseMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Prescription Details
              </h3>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Patient Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Patient Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400" size={18} />
                    <span className="font-medium text-gray-900">
                      {selectedPrescription.patient_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Patient ID: {selectedPrescription.patient_id}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="text-gray-400" size={16} />
                    <span>
                      Prescribed by {selectedPrescription.prescribing_doctor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prescription Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Prescription Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Priority</div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedPrescription.priority)}`}
                    >
                      {selectedPrescription.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedPrescription.status)}`}
                    >
                      {selectedPrescription.status === "dispensed"
                        ? "Dispensed"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Date Issued
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(selectedPrescription.date_issued)}
                    </div>
                  </div>
                  {selectedPrescription.date_dispensed && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">
                        Date Dispensed
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(selectedPrescription.date_dispensed)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Medications
                </h4>
                <div className="space-y-3">
                  {selectedPrescription.medications?.map((med) => (
                    <div
                      key={med.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Pill className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {med.medication_name}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Dosage:</span>{" "}
                            {med.dosage} |
                            <span className="font-medium"> Quantity:</span>{" "}
                            {med.quantity}
                          </div>
                          {med.instructions && (
                            <div className="text-sm text-gray-700 bg-blue-50 rounded p-2 border border-blue-100">
                              <span className="font-medium">Instructions:</span>{" "}
                              {med.instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Notes
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        className="text-amber-600 flex-shrink-0 mt-0.5"
                        size={18}
                      />
                      <p className="text-sm text-amber-900">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedPrescription.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDispense(selectedPrescription.id)}
                    disabled={dispenseMutation.isPending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Mark as Dispensed
                  </button>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
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
