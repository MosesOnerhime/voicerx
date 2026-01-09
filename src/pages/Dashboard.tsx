import React from 'react';
import { 
  Users, Clock, CheckCircle, AlertCircle, 
  Search, Bell, LayoutDashboard, FileText, 
  ClipboardList, UserCircle, Eye, ChevronRight
} from 'lucide-react';
import { mockPatients, mockActivities } from '../data/mockData';

// --- TYPES TO FIX THE ERRORS ---
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'pending' | 'updated' | 'approved';
  visitDate: string;
}

interface Activity {
  type: 'record' | 'status' | 'update';
  content: string;
  timestamp: string;
}

export default function Dashboard() {
  // Use 'unknown' first to break the type conflict as suggested by the error
  const patients = (mockPatients as unknown) as Patient[];
  
  // This mapping fixes the 'Property content is missing' error 
  // by ensuring whatever the mock data has, it gets assigned to 'content'
  const activities = (mockActivities as any[]).map(act => ({
    type: act.type || 'update',
    content: act.content || act.description || "Activity updated", 
    timestamp: act.timestamp || act.time || "Just now"
  })) as Activity[];

  const pendingCount = patients.filter(p => p.status === 'pending').length;
  const updatedCount = patients.filter(p => p.status === 'updated').length;
  const approvedCount = patients.filter(p => p.status === 'approved').length;

  return (
    <div className="flex min-h-screen bg-[#FBFBFE] font-sans">
      {/* --- SIDEBAR: Matches image_372aa7.png --- */}
      <aside className="w-64 bg-[#1E1B4B] text-white flex flex-col fixed h-full shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#7C3AED] p-2 rounded-lg shadow-lg shadow-purple-500/40 text-white">
            <ClipboardList size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg tracking-tight">HealthSync</h1>
            <p className="text-[10px] text-purple-300 uppercase tracking-[0.2em] font-semibold">Physician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, active: true },
            { name: 'Patients', icon: Users },
            { name: 'Records', icon: FileText },
            { name: 'Notifications', icon: Bell },
            { name: 'Profile', icon: UserCircle },
          ].map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              item.active 
                ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}>
              <item.icon size={18} />
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold shadow-inner">MC</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Dr. Michael Chen</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">Internal Medicine</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 text-sm font-medium">Welcome back, Dr. Chen</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 w-72 transition-all shadow-sm" />
            </div>
            <button className="relative p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-600 rounded-full border-2 border-white shadow-sm"></span>
            </button>
          </div>
        </header>

        {/* --- STATS CARDS: Matches the layout in image_372aa7.png --- */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Patients', val: patients.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: '↑ 12% from last week' },
            { label: 'Pending Review', val: pendingCount, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Updated Records', val: updatedCount, icon: AlertCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Approved Today', val: approvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '↑ 3 records' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                 <p className="text-slate-500 text-[13px] font-semibold tracking-tight uppercase">{stat.label}</p>
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg shadow-sm`}><stat.icon size={18} /></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 leading-none">{stat.val}</h3>
              {stat.trend && <p className="text-emerald-600 text-[11px] font-bold mt-3 inline-block px-2 py-0.5 bg-emerald-50 rounded-md">{stat.trend}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* --- TABLE: Matches your exact column design --- */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Assigned Patients</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4">Record Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[11px] border border-slate-200">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-purple-600 transition-colors">{patient.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">{patient.age} yrs, {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-tighter">{patient.id}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{patient.visitDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                        patient.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        patient.status === 'updated' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          patient.status === 'approved' ? 'bg-emerald-500' :
                          patient.status === 'updated' ? 'bg-amber-500' : 'bg-purple-500'
                        }`} />
                        {patient.status === 'pending' ? 'Pending Review' : patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-bold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1.5 ml-auto uppercase tracking-tighter shadow-sm bg-white">
                        <Eye size={12} /> View Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- ACTIVITY: Matches image_372aa7.png sidebar --- */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 text-base mb-6">Recent Activity</h3>
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
          </div>
        </div>
      </main>
    </div>
  );
}