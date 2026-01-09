import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  User,
  Stethoscope
} from 'lucide-react';
// Go up two levels (out of layout, out of components) to reach src, then into lib
import { cn } from '../../lib/utils';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Patients', path: '/patients', icon: Users },
  { title: 'Records', path: '/records', icon: FileText },
  { title: 'Notifications', path: '/notifications', icon: Bell },
  { title: 'Profile', path: '/profile', icon: User },
];

export function DoctorSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-sidebar-foreground">HealthSync</h1>
          <p className="text-xs text-sidebar-foreground/60">Physician Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            MC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Michael Chen</p>
            <p className="text-xs text-sidebar-foreground/60">Internal Medicine</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
