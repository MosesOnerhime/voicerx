import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { Search, UserCheck, Users, Loader2, RefreshCw, Activity } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "../../hooks/use-toast";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  specialty: string;
  email: string;
  isAvailable: boolean;
  isBusy: boolean;
  currentPatients: number;
  queueCount: number;
}

const AvailableDoctors = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const fetchDoctors = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const url = showAvailableOnly 
        ? 'http://localhost:5001/api/appointments/assign-doctor?available=true'
        : 'http://localhost:5001/api/appointments/assign-doctor?available=true';
        
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doctors"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDoctors();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, showAvailableOnly]);

  const handleRefresh = () => {
    fetchDoctors();
    toast({
      title: "Refreshed",
      description: "Doctor availability updated"
    });
  };

  const filteredDoctors = doctors.filter(doc => {
    const search = searchQuery.toLowerCase();
    return doc.name.toLowerCase().includes(search) ||
           doc.specialty.toLowerCase().includes(search) ||
           doc.email.toLowerCase().includes(search);
  });

  const availableCount = doctors.filter(d => d.isAvailable).length;
  const busyCount = doctors.filter(d => !d.isAvailable).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            Medical Staff Availability
          </h1>
          <p className="text-gray-500 font-medium">
            Real-time doctor status · {availableCount} available · {busyCount} busy
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#390C87] outline-none transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showAvailableOnly ? "default" : "outline"}
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className="gap-2"
          >
            <Activity size={16} />
            {showAvailableOnly ? "Show All" : "Available Only"}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{doctors.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available Now</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Currently Busy</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{busyCount}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Activity className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading doctors...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">
            {searchQuery ? "No doctors match your search" : "No doctors found"}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-sm text-[#390C87] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

// Separate Doctor Card Component for cleaner code
const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
  const getStatusBadge = () => {
    if (!doctor.isAvailable) {
      return (
        <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          Busy
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Available
      </span>
    );
  };

  const getQueueStatus = () => {
    if (!doctor.isAvailable && doctor.isBusy) {
      return <span className="text-xs text-red-600 font-semibold">In Consultation</span>;
    }
    if (doctor.queueCount === 0) {
      return <span className="text-xs text-green-600 font-semibold">Free now</span>;
    }
    if (doctor.queueCount < 3) {
      return <span className="text-xs text-yellow-600 font-semibold">Light load</span>;
    }
    return <span className="text-xs text-orange-600 font-semibold">Busy queue</span>;
  };

  return (
    <div 
      className={`bg-white p-6 rounded-2xl shadow-card border transition-all group hover:shadow-lg ${
        doctor.isAvailable 
          ? 'border-green-200 hover:border-green-400' 
          : 'border-red-200 hover:border-red-400'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
          doctor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <UserCheck size={24} />
        </div>
        {getStatusBadge()}
      </div>

      {/* Doctor Info */}
      <h3 className="font-bold text-lg text-gray-900 mb-1">{doctor.name}</h3>
      <p className="text-sm text-gray-500 mb-1">{doctor.specialty}</p>
      <p className="text-xs text-gray-400 mb-4">{doctor.email}</p>

      {/* Queue Info */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
          Current Workload
        </p>
        
        {/* Queue Count */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">Waiting in queue:</span>
          <span className="font-bold text-gray-800">
            {doctor.queueCount} patient{doctor.queueCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-600">Status:</span>
          {getQueueStatus()}
        </div>
      </div>

      {/* Action Hint */}
      {doctor.isAvailable && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {doctor.queueCount === 0 
              ? "✓ Ready for new patient" 
              : `Can accept more patients (${doctor.queueCount} waiting)`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableDoctors;