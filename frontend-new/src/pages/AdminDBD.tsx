'use client'
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { Building2, Users, Calendar, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { label: 'Total Staff', value: '24', icon: Users, color: 'bg-blue-500' },
    { label: 'Appointments Today', value: '48', icon: Calendar, color: 'bg-green-500' },
    { label: 'Active Patients', value: '156', icon: Activity, color: 'bg-purple-500' },
    { label: 'Departments', value: '8', icon: Building2, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Manage Staff</span>
          </button>
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">View Schedule</span>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium text-green-900">Reports</span>
          </button>
          <button className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
