import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  UserCircle, 
  ClipboardList,
  AlertTriangle 
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#FBFBFE]">
      {/* --- SIDEBAR (Kept for UI Consistency) --- */}
      <aside className="w-64 bg-[#1E1B4B] text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#7C3AED] p-2 rounded-lg">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">HealthSync</h1>
            <p className="text-[10px] text-purple-300 uppercase tracking-widest mt-1 font-semibold">Physician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-all">
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link to="/patients" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5">
            <Users size={18} />
            <span className="font-medium text-sm">Patients</span>
          </Link>
          <Link to="/records" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5">
            <FileText size={18} />
            <span className="font-medium text-sm">Records</span>
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          {/* Large stylized 404 - Matches your healthcare purple theme */}
          <div className="relative inline-block">
             <h1 className="text-[180px] font-black text-slate-100 leading-none">404</h1>
             <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle size={80} className="text-[#7C3AED] opacity-20" />
             </div>
          </div>
          
          <div className="relative -mt-10">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Page Not Found</h2>
            <p className="mx-auto mb-10 max-w-md text-slate-500 font-medium">
              We couldn't find the page you're looking for. It might have been moved, 
              or the URL <span className="text-[#7C3AED] font-mono bg-purple-50 px-1 rounded">{location.pathname}</span> doesn't exist.
            </p>
            
            <div className="flex justify-center">
              {/* REPLACED <Button> WITH RAW TAILWIND */}
              <Link 
                to="/" 
                className="flex items-center gap-2 px-8 py-4 bg-[#7C3AED] text-white rounded-2xl font-bold shadow-lg shadow-purple-600/30 hover:bg-[#6D28D9] transition-all hover:-translate-y-1 active:scale-95"
              >
                <Home size={20} />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;