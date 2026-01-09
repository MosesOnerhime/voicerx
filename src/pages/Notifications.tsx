import React from 'react';
import { Link } from "react-router-dom";
import { 
  Bell, FileText, RefreshCw, CheckCircle, 
  Check, Trash2, ClipboardList, LayoutDashboard, 
  Users, UserCircle, Search 
} from 'lucide-react';
import { mockActivities } from '../data/mockData';

// --- TYPES TO PREVENT ERRORS ---
interface Activity {
  id: string;
  type: 'intake' | 'update' | 'approval' | 'record' | 'status';
  content?: string;
  message?: string;
  timestamp: string;
}

export default function Notifications() {
  // Mapping incoming data to ensure properties like 'message' and 'content' don't crash the app
  const notifications = (mockActivities as any[]).map(act => ({
    id: act.id || Math.random().toString(),
    type: act.type || 'update',
    message: act.message || act.content || act.description || "Notification received",
    timestamp: act.timestamp || act.time || "Just now"
  })) as Activity[];

  return (
    <div className="flex min-h-screen bg-[#FBFBFE]">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1E1B4B] text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#7C3AED] p-2 rounded-lg shadow-lg shadow-purple-500/40">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">HealthSync</h1>
            <p className="text-[10px] text-purple-300 uppercase tracking-widest font-semibold mt-1">Physician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all">
            <LayoutDashboard size={18} />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>
          <Link to="/patients" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5">
            <Users size={18} />
            <span className="font-semibold text-sm">Patients</span>
          </Link>
          <Link to="/records" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5">
            <FileText size={18} />
            <span className="font-semibold text-sm">Records</span>
          </Link>
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40">
            <Bell size={18} />
            <span className="font-semibold text-sm">Notifications</span>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h2>
            <p className="text-slate-500 text-sm font-medium">Stay updated on patient activities</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 w-64 shadow-sm" />
            </div>
            <button className="relative p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="max-w-3xl space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <Bell className="h-5 w-5 text-[#7C3AED]" />
              <span className="text-sm font-bold text-slate-600">
                {notifications.length} Unread Notifications
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

          {/* Notifications List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {notifications.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-5 p-5 transition-all hover:bg-slate-50/80 group cursor-pointer"
                >
                  <div className={`rounded-2xl p-3 shadow-sm transition-transform group-hover:scale-110 ${
                    activity.type === 'approval' || activity.type === 'status' ? 'bg-emerald-50 text-emerald-600' :
                    activity.type === 'update' ? 'bg-amber-50 text-amber-600' : 
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {activity.type === 'approval' || activity.type === 'status' ? <CheckCircle size={18} /> :
                     activity.type === 'update' ? <RefreshCw size={18} /> : <FileText size={18} />}
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
                    View Activity
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}