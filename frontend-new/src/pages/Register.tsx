import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { authApi } from "../components/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../services/schema";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { Sparkles, AlertCircle, Eye, EyeOff, Users, Stethoscope, Pill, Shield } from "lucide-react";

// Demo credentials for quick testing - includes uploaded staff
// Note: Staff uploaded via CSV get password "Welcome@123" by default
const demoAccounts = [
  // Admin
  { email: "admin@testhospital.com", password: "TestPassword123", label: "Admin", role: "admin" },
  // Doctors (from uploaded staff - default password: Welcome@123)
  { email: "john.smith@testhospital.com", password: "Welcome@123", label: "Dr. John Smith", role: "doctor" },
  { email: "mary.johnson@testhospital.com", password: "Welcome@123", label: "Dr. Mary Johnson", role: "doctor" },
  // Nurses (from uploaded staff)
  { email: "robert.jones@testhospital.com", password: "Welcome@123", label: "Robert Jones", role: "nurse" },
  { email: "linda.davis@testhospital.com", password: "Welcome@123", label: "Linda Davis", role: "nurse" },
  // Pharmacists (from uploaded staff)
  { email: "david.moore@testhospital.com", password: "Welcome@123", label: "David Moore", role: "pharmacist" },
  { email: "jennifer.taylor@testhospital.com", password: "Welcome@123", label: "Jennifer Taylor", role: "pharmacist" },
];

// Group accounts by role for display
const demoByRole = {
  admin: demoAccounts.filter(a => a.role === "admin"),
  doctor: demoAccounts.filter(a => a.role === "doctor"),
  nurse: demoAccounts.filter(a => a.role === "nurse"),
  pharmacist: demoAccounts.filter(a => a.role === "pharmacist"),
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [demoIndex, setDemoIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Fill form with specific demo credentials
  const fillDemoCredentials = (account?: typeof demoAccounts[0]) => {
    const demo = account || demoAccounts[demoIndex];
    setValue("email", demo.email);
    setValue("password", demo.password);
    if (!account) {
      setDemoIndex((prev) => (prev + 1) % demoAccounts.length);
    }
    clearErrors("root");
    setShowDemoPanel(false);
  };

  const onSubmit = async (data: LoginFormValues) => {
  try {
    clearErrors("root");
    console.log("Sign in attempt with:", data.email);
    
    // Replace authApi.manualLogin with direct fetch call
    const response = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();
    
    if (!result || !result.user) {
      throw new Error("User not found");
    }

    dispatch(setCredentials({ user: result.user, token: result.token }));
    
    const rolePaths: Record<string, string> = {
      admin: "/admin/dashboard",
      nurse: "/nurse/dashboard",
      doctor: "/doctor/dashboard",
      pharmacist: "/pharmacy/dashboard",
    };

    const userRole = result.user.role?.toLowerCase();
    const targetPath = rolePaths[userRole] || "/dashboard";

    navigate(targetPath);

  } catch (error: any) {
    console.error("Login Error:", error);
    
    let errorMessage = "Something went wrong. Please try again.";
    
    if (error.message === "User not found") {
      errorMessage = "User not found. Please check your email.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    setError("root", { 
      type: "manual",
      message: errorMessage 
    });
  }
};
  return (
    <div className="flex min-h-screen font-subheading">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-700 to-violet-600 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white max-w-lg">
          <img
            src="https://raw.createusercontent.com/7ad8eebd-17f3-4e08-99f8-e5b08e5fe2a7/"
            alt="Health Management 3D Illustration"
            className="w-full h-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-bold mb-4 font-heading">
            Your Health, Simplified
          </h1>
          <p className="text-lg text-purple-100">
            Manage your wellness journey with our comprehensive health
            management system. Track, monitor, and improve your health all in
            one place.
          </p>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl mb-4 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoPanel(!showDemoPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Demo Logins
              </button>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600 font-subheading">
              Sign in to access your health dashboard
            </p>
          </div>

          {/* Demo Credentials Panel */}
          {showDemoPanel && (
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-amber-800">Demo Accounts</h3>
                <span className="text-xs text-amber-600">Click to use</span>
              </div>

              <div className="space-y-3">
                {/* Admin */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700 uppercase">Admin</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {demoByRole.admin.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemoCredentials(acc)}
                        className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctors */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Doctors</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {demoByRole.doctor.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemoCredentials(acc)}
                        className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nurses */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700 uppercase">Nurses</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {demoByRole.nurse.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemoCredentials(acc)}
                        className="px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pharmacists */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-700 uppercase">Pharmacists</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {demoByRole.pharmacist.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemoCredentials(acc)}
                        className="px-2.5 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-amber-600/80 text-center">
                Staff password: <code className="px-1.5 py-0.5 bg-amber-100 rounded">Welcome@123</code> | Admin: <code className="px-1.5 py-0.5 bg-amber-100 rounded">TestPassword123</code>
              </p>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-subheading text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                {...register("email")}
                onChange={(e) => {
                  register("email").onChange(e);
                  clearErrors("root");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-subheading font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    clearErrors("root");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm font-subheading font-medium text-purple-600 hover:text-purple-700"
              >
                Forgot password?
              </a>
            </div>

            {/* Error Notification */}
            {errors.root && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {errors.root.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg shadow-purple-500/30 font-heading disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Sign Up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;