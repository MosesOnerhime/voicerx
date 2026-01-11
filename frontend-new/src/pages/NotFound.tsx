import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  ArrowLeft, // Changed icon for "Go Back" context
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
    const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h2 className="mb-3 text-3xl font-bold text-slate-900 font-heading">Page Not Found</h2>
            <p className="mx-auto mb-10 max-w-md text-slate-500 font-medium font-subheading">
              We couldn't find the page you're looking for. It might have been moved, 
              or the URL <span className="text-[#390C87] font-mono bg-purple-50 px-1 rounded">{location.pathname}</span> doesn't exist.
            </p>
            
            <div className="flex justify-center">
              {/* UPDATED BUTTON: Uses navigate(-1) to go back */}
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-8 py-4 bg-[#390C87] text-white rounded-2xl font-bold shadow-lg shadow-purple-900/20 hover:bg-[#2a0963] transition-all hover:-translate-y-1 active:scale-95"
              >
                <ArrowLeft size={20} />
                Go to Previous Page
              </button>
              </div>
      </div>
    </div>
  );
};

export default NotFound;

