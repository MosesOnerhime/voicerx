import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../components/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../services/schema";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { Sparkles } from "lucide-react";

// Demo credentials for quick testing
const demoAccounts = [
  { email: "admin@testhospital.com", password: "TestPassword123", label: "Test Hospital Admin" },
];


const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [demoIndex, setDemoIndex] = useState(0);

  const { register, handleSubmit: handleFormSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Fill form with demo credentials (cycles through available accounts)
  const fillDemoCredentials = () => {
    const demo = demoAccounts[demoIndex];
    setValue("email", demo.email);
    setValue("password", demo.password);
    setDemoIndex((prev) => (prev + 1) % demoAccounts.length);
  };


  const onSubmit = async (data: LoginFormValues) => {
   try {
    
    console.log("Sign in attempt with valid data:", data);
      // 1. Cross-check with backend/DB
      const result = await authApi.manualLogin(data);
      
      // 2. Update Redux state with user and token
      dispatch(setCredentials({ user: result.user, token: result.token }));
      
      // 3. Redirect (e.g., navigate('/dashboard'))
      const role= result.user.role;
      navigate(`/${role}/dashboard`);
     
    } catch (error: any) {
      setError("root", { 
        message: error.response?.data?.message || "Invalid email or password" 
      });
    } 
  }
/*
  const handleSuccess = async (response: any) => {
    try {
        const googleToken = response.credential;
        // 1. Call your backend API
      const userData = await authApi.googleLogin(googleToken);
      
      // 2. Expert Step: Save your backend's JWT to localStorage
      localStorage.setItem('token', userData.accessToken);
      
      // 3. Redirect user to Dashboard/Home
      console.log('Login Successful, user data:', userData);
    } catch (err) {
      alert('Authentication with backend failed.');
    }

    }

  const handleError = () => {
    console.log("Login Failed");
  };
  */

  return (
    <div className="flex min-h-screen font-subheading">
      {/* Left Side - 3D Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-700 to-violet-600 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-tertiary max-w-lg">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-tertiary">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
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
              {/* Demo Login Button */}
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Demo Login
              </button>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600 font-subheading">
              Sign in to access your health dashboard
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-subheading text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
              {...register("email")}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-subheading font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}   
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg shadow-purple-500/30 font-heading"
            >
              {isSubmitting ? "Checking..." : "Sign in"}
            </button>
          </form>

          {/* Divider *
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

{/** 
          * Social Sign In *
          <div className="flex justify-center w-full">
                <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"       Gives it the border you want 
                size="large"        /Makes it fill the space better 
                text="signin_with"  /* Options: signup_with, continue_with 
                shape="rectangular" /* Matches your input field corners 
                width="100%"         Makes it responsive to your grid 
            />
           **/ }
          
          

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      </div>
  
  )
}

export default Register