import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { navConfig } from '../constants/index';
import { type RootState } from '../store';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { LogOut, Menu, X } from 'lucide-react';
import NavGroup from './NavGroup';

const Gendashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role?.toLowerCase() || 'user';
  const links = navConfig[role as keyof typeof navConfig] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen font-subheading">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#29095F] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-purple-700 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Branding Section */}
        <div className="p-6">
          <h2 className="font-heading text-xl font-bold text-white truncate">
            {user?.hospitalId?.name || "HealthFlow"}
          </h2>
          <p className="text-[10px] text-purple-300 uppercase tracking-widest mt-1">
            Hospital Management
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {links.map((link) => {
            if ('children' in link && link.children) {
              return <NavGroup key={link.name} item={link} onNavigate={closeSidebar} />;
            }

            if (link.path) {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium group ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                      : "text-purple-200 hover:bg-purple-800 hover:text-white"
                  }`}
                >
                  <link.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-purple-300 group-hover:text-white"
                    }`}
                  />
                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            }

            return null;
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-purple-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-purple-200 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all group"
          >
            <LogOut className="h-5 w-5 text-purple-300 group-hover:text-red-300" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-14 sm:h-16 bg-white border-b flex items-center px-4 sm:px-8 justify-between shadow-sm z-10">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>

          <span className="font-semibold text-gray-700 capitalize text-sm sm:text-base">
            {role} Portal
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm sm:text-base">
              {user?.firstName?.[0]}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-tertiary p-4 sm:p-6 lg:p-8 font-subheading">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Gendashboard;
