
import { useSelector, useDispatch } from 'react-redux'
import {navConfig} from '../constants/index'
import { type RootState } from '../store'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { LogOut } from 'lucide-react';

import { type LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const Gendashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  
  const role = user?.role || 'user';
  const links = navConfig[role as keyof typeof navConfig] || [];

  const handleLogout = () => {
  dispatch(logout());
  navigate('/');
};

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-subheading">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="font-heading text-2xl font-bold text-purple-700">HealthFlow</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium group ${
                  isActive 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200" 
                    : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {/* Render the Icon dynamically */}
                <link.icon className={`h-5 w-5 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600"
                }`} />
                
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Optional: Logout Button at bottom */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
      

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between shadow-sm z-10">
          <span className="font-semibold text-gray-700 capitalize">{role} Portal</span>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</p>
               <p className="text-xs text-gray-500 capitalize">{role}</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
               {user?.firstName?.[0]}
             </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default Gendashboard;