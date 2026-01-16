import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, FileText, RefreshCw, CheckCircle,
  Check, Trash2, Search, Loader2, AlertCircle, Info, Users
} from 'lucide-react';
import { useDoctorQueue } from '../../hooks/useDoctorQueue';
import { Button } from '../../components/ui/form-controls';

interface Activity {
  id: string;
  type: 'intake' | 'update' | 'approval' | 'record' | 'status' | 'assignment';
  message: string;
  timestamp: string;
  appointmentId: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { appointments, isLoading, error, refetch, stats } = useDoctorQueue();

  // Generate notifications from queue activity
  const notifications = useMemo(() => {
    return appointments.map((appt): Activity => {
      let type: Activity['type'] = 'record';
      let message = '';

      if (appt.status === 'pending') {
        type = 'assignment';
        message = `New patient assigned: ${appt.patient.firstName} ${appt.patient.lastName}`;
      } else if (appt.status === 'updated') {
        type = 'update';
        message = `Consultation in progress: ${appt.patient.firstName} ${appt.patient.lastName}`;
      } else if (appt.status === 'approved') {
        type = 'approval';
        message = `Record completed: ${appt.patient.firstName} ${appt.patient.lastName}`;
      } else {
        message = `Patient record: ${appt.patient.firstName} ${appt.patient.lastName}`;
      }

      return {
        id: appt.appointmentId,
        type,
        message,
        timestamp: new Date(appt.lastUpdated).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        appointmentId: appt.appointmentId,
      };
    });
  }, [appointments]);

  if (error) {
    return (
      <div className="space-y-6">
        <main className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium text-slate-900">Failed to load notifications</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <Button onClick={() => refetch()} className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <main className="container mx-auto px-6 py-8">
        {/* --- MAIN CONTENT --- */}

        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h2>
            <p className="text-slate-500 text-sm font-medium">Stay updated on patient activities</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search notifications..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 w-64 shadow-sm" />
            </div>
            <button
              onClick={() => refetch()}
              className="relative p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="relative p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Bell size={18} />
              {stats.emergency > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Info Banner */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Notifications from Queue Activity</p>
            <p className="text-xs text-blue-600 mt-1">
              Notifications are derived from your patient queue. A dedicated notifications system will be available in a future update.
            </p>
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <Bell className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-sm font-bold text-slate-600">
                {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                <Check className="h-4 w-4" />
                Mark all read
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-slate-400">
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && notifications.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">No notifications</h3>
              <p className="text-sm text-slate-500 mt-2">
                You'll see notifications here when patients are assigned to your queue
              </p>
            </div>
          )}

          {/* Notifications List */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {notifications.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-5 p-5 transition-all hover:bg-slate-50/80 group cursor-pointer"
                    onClick={() => navigate(`/doctor/patient/${activity.appointmentId}`)}
                  >
                    <div className={`rounded-2xl p-3 shadow-sm transition-transform group-hover:scale-110 ${
                      activity.type === 'approval' || activity.type === 'status' ? 'bg-emerald-50 text-emerald-600' :
                      activity.type === 'update' ? 'bg-amber-50 text-amber-600' :
                      activity.type === 'assignment' ? 'bg-purple-50 text-purple-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {activity.type === 'approval' || activity.type === 'status' ? <CheckCircle size={18} /> :
                       activity.type === 'update' ? <RefreshCw size={18} /> :
                       activity.type === 'assignment' ? <Bell size={18} /> :
                       <FileText size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-800 leading-snug group-hover:text-[#7C3AED] transition-colors">
                        {activity.message}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        {activity.timestamp}
                      </p>
                    </div>

                    <button className="px-4 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-slate-200">
                      View Record
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
