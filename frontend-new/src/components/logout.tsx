

import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { type RootState } from "../../store";
import { toast } from "../../hooks/use-toast";

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      // Call backend logout API
      if (token) {
        await fetch('http://localhost:5001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear Redux state
      dispatch(logout());

      // Show success message
      toast({
        title: "Logged out",
        description: `Goodbye, ${user?.firstName || 'user'}!`
      });

      // Redirect to login
      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      
      // Still log out locally
      dispatch(logout());
      navigate('/login');
      
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "You've been logged out locally"
      });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;