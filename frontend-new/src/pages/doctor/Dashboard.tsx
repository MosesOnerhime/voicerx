import { useState } from 'react';
import {
  Users, Clock, CheckCircle, AlertCircle,
  Search, Bell, FileText, Eye, RefreshCw, Loader2,
  Play, Power, PowerOff
} from 'lucide-react';
import { useDoctorQueue } from '../../hooks/useDoctorQueue';
import { doctorApi } from '../../services/api/doctor';
import { calculateAge } from '../../lib/dateUtils';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { toast } from 'sonner';

interface Activity {
  type: 'record' | 'status' | 'update';
  content: string;
  timestamp: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const {
    appointments,
    stats,
    isLoading,
    error,
    refetch,
    isAvailable,
    isTogglingAvailability,
    toggleAvailability
  } = useDoctorQueue();

  const [startingConsultation, setStartingConsultation] = useState<string | null>(null);

  // Generate activities from appointments
  const activities = appointments.map(appt => ({
    type: (appt.status === 'approved' ? 'status' : 'record') as Activity['type'],
    content: `Record for ${appt.patient.firstName} ${appt.patient.lastName} was ${appt.status}`,
    timestamp: new Date(appt.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) as Activity[];

  const pendingCount = stats.pending;
  const updatedCount = stats.inProgress;
  const approvedCount = stats.completed;

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability();
      toast.success(isAvailable ? 'You are now unavailable for new patients' : 'You are now available for new patients');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleStartConsultation = async (appointmentId: string, patientName: string) => {
    if (!token) return;

    try {
      setStartingConsultation(appointmentId);
      await doctorApi.startConsultation(appointmentId, token);
      toast.success(`Started consultation with ${patientName}`);
      navigate(`/doctor/patient/${appointmentId}`);
    } catch (err: any) {
      console.error('Failed to start consultation:', err);
      toast.error(err.response?.data?.message || 'Failed to start consultation');
    } finally {
      setStartingConsultation(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-slate-900">Failed to load dashboard</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- MAIN CONTENT --- */}

        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 text-sm font-medium">Welcome back,</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Availability Toggle */}
            <button
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              {isTogglingAvailability ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isAvailable ? (
                <Power size={16} />
              ) : (
                <PowerOff size={16} />
              )}
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 w-72 transition-all shadow-sm" />
            </div>
            <button
              onClick={() => refetch()}
              className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="relative p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Bell size={18} />
              {stats.emergency > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white shadow-sm"></span>
              )}
            </button>
          </div>
        </header>

        {/* Unavailable Warning Banner */}
        {!isAvailable && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <PowerOff className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">You are currently unavailable</p>
              <p className="text-xs text-amber-600">New patients cannot be assigned to you. Toggle availability when ready.</p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Go Available
            </button>
          </div>
        )}

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Patients', val: stats.total, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: stats.emergency > 0 ? `${stats.emergency} emergency` : undefined },
            { label: 'Waiting in Queue', val: pendingCount, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'In Consultation', val: updatedCount, icon: AlertCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Completed Today', val: approvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-slate-500 text-[13px] font-semibold tracking-tight uppercase">{stat.label}</p>
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg shadow-sm`}><stat.icon size={18} /></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 leading-none">{isLoading ? '-' : stat.val}</h3>
              {stat.trend && <p className="text-red-600 text-[11px] font-bold mt-3 inline-block px-2 py-0.5 bg-red-50 rounded-md">{stat.trend}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* --- PATIENT QUEUE TABLE --- */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Patient Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a patient to start consultation</p>
              </div>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>

            {isLoading && appointments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No patients in queue</p>
                <p className="text-slate-400 text-sm mt-1">Patients will appear here when assigned to you</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/60 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Patient ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map((appt) => {
                    const isPending = appt.status === 'pending';
                    const isInProgress = appt.status === 'updated';
                    const isStarting = startingConsultation === appt.appointmentId;

                    return (
                      <tr key={appt.appointmentId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] border ${
                              appt._apiData?.priority === 'EMERGENCY' ? 'bg-red-100 text-red-600 border-red-200' :
                              appt._apiData?.priority === 'URGENT' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {appt.patient?.firstName?.[0]}{appt.patient?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-purple-600 transition-colors">
                                {appt.patient?.firstName} {appt.patient?.lastName}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                                {calculateAge(appt.patient?.dateOfBirth)} yrs, {appt.patient?.gender}
                                {appt._apiData?.priority === 'EMERGENCY' && (
                                  <span className="ml-2 text-red-600 font-bold">EMERGENCY</span>
                                )}
                                {appt._apiData?.priority === 'URGENT' && (
                                  <span className="ml-2 text-amber-600 font-bold">URGENT</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-tighter">
                          {appt.patient?.patientIdNumber || appt.patient?.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                            appt.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            appt.status === 'updated' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-purple-50 text-purple-600 border-purple-100'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              appt.status === 'approved' ? 'bg-emerald-500' :
                              appt.status === 'updated' ? 'bg-amber-500' : 'bg-purple-500'
                            }`} />
                            {appt.status === 'pending' ? 'Waiting' :
                             appt.status === 'updated' ? 'In Progress' :
                             'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleStartConsultation(appt.appointmentId, `${appt.patient?.firstName} ${appt.patient?.lastName}`)}
                                disabled={isStarting}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-tighter shadow-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                              >
                                {isStarting ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Play size={12} />
                                )}
                                Start
                              </button>
                            )}
                            {isInProgress && (
                              <button
                                onClick={() => navigate(`/doctor/patient/${appt.appointmentId}`)}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-tighter shadow-sm bg-amber-500 text-white hover:bg-amber-600"
                              >
                                <Play size={12} />
                                Continue
                              </button>
                            )}
                            <button
                              className="text-[10px] font-bold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 uppercase tracking-tighter shadow-sm bg-white"
                              onClick={() => navigate(`/doctor/patient/${appt.appointmentId}`)}
                            >
                              <Eye size={12} /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* --- ACTIVITY --- */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 text-base mb-6">Recent Activity</h3>
            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <FileText className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`p-2.5 h-fit rounded-xl transition-all shadow-sm ${
                      activity.type === 'record' ? 'bg-purple-50 text-purple-600' :
                      activity.type === 'status' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {activity.type === 'record' ? <FileText size={15} /> :
                       activity.type === 'status' ? <CheckCircle size={15} /> : <Clock size={15} />}
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                      <p className="text-[13px] text-slate-800 font-semibold leading-relaxed tracking-tight">{activity.content}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    </div>
  );
}
