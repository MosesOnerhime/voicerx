import {Link, Outlet} from 'react-router-dom'
import { useSelector } from 'react-redux'
import {navConfig} from '../constants/index'
import { type RootState } from '../store'

const Gendashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'user';

  // Get the links specifically for this user's role
  const links = navConfig[role as keyof typeof navConfig] || [];



  return (
    <div className="flex h-screen bg-tertiary font-subheading">

        {/*SHARED SIDEBAR*/}
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="font-heading text-xl font-bold text-primary mb-10">MediFlow</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="block p-3 rounded-lg hover:bg-primary/5 text-gray-700 hover:text-primary transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/*main content*/}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <span className="font-medium text-gray-500 capitalize">{role} Portal</span>
          <div className="flex items-center gap-4">
             {/* Shared Notification & Profile Icon */}
          </div>
        </header>
        
        <main className="p-8">
          {/* This Outlet renders the specific page (e.g., DoctorQueue or AdminPanel) */}
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default Gendashboard