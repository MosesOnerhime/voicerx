'use client'
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Building2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import axios from "axios";

// API URL - uses Vite proxy to forward to backend
const API_URL = '/api';

// Demo data arrays for generating random credentials
const hospitalPrefixes = ["Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt", "Enugu", "Kaduna", "Benin", "Onitsha", "Owerri"];
const hospitalTypes = ["General Hospital", "Medical Center", "Teaching Hospital", "Specialist Hospital", "Health Clinic", "Memorial Hospital"];
const streets = ["Marina Street", "Broad Street", "Adeola Odeku", "Allen Avenue", "Awolowo Road", "Herbert Macaulay Way", "Ozumba Mbadiwe", "Ademola Adetokunbo"];
const cities = ["Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt", "Enugu"];
const firstNames = ["Adebayo", "Chioma", "Emeka", "Fatima", "Gbenga", "Halima", "Ibrahim", "Janet", "Kunle", "Lola", "Musa", "Ngozi", "Oluwaseun", "Patience"];
const lastNames = ["Ogundimu", "Okonkwo", "Abdullahi", "Adeyemi", "Chukwu", "Bello", "Eze", "Abubakar", "Okafor", "Yusuf", "Nnamdi", "Olawale"];

// Generate random demo data
const generateDemoData = () => {
  const randomId = Math.floor(Math.random() * 100000);
  const hospitalPrefix = hospitalPrefixes[Math.floor(Math.random() * hospitalPrefixes.length)];
  const hospitalType = hospitalTypes[Math.floor(Math.random() * hospitalTypes.length)];
  const hospitalName = `${hospitalPrefix} ${hospitalType}`;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const emailDomain = hospitalName.toLowerCase().replace(/\s+/g, '').slice(0, 15);

  return {
    hospitalName,
    hospitalEmail: `info${randomId}@${emailDomain}.com`,
    hospitalPhone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    hospitalAddress: `${Math.floor(Math.random() * 200) + 1} ${street}, ${city}`,
    registrationNumber: `REG${randomId}`,
    adminFirstName: firstName,
    adminLastName: lastName,
    adminEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomId}@${emailDomain}.com`,
    adminPassword: "DemoPass123",
    confirmPassword: "DemoPass123"
  };
};

export default function SignUp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalEmail: "",
    hospitalPhone: "",
    hospitalAddress: "",
    registrationNumber:"",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fill form with demo data
  const fillDemoData = () => {
    const demoData = generateDemoData();
    setFormData(demoData);
    toast({
      title: "Demo Data Filled!",
      description: `Hospital: ${demoData.hospitalName}`,
      className: "bg-purple-600 text-white"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Client-side Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      // 2. Prepare Payload (flat structure matching backend expectation)
      const payload = {
        hospitalName: formData.hospitalName,
        email: formData.hospitalEmail,
        phone: formData.hospitalPhone,
        address: formData.hospitalAddress,
        registrationNumber: formData.registrationNumber,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.hospitalPhone, // Using hospital phone as admin phone
        adminPassword: formData.adminPassword,
      };

      // 3. API Call
      await axios.post(`${API_URL}/auth/register`, payload);
      console.log("Registration API Success!");
      

      // 4. Success Handling
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account. Redirecting to sign in....",
        className: "bg-green-600 text-white border-none"
      });

      // Redirect to Login (/) after a short delay
      setTimeout(() => navigate("/signin"), 3000);

    } catch (error: any) {
  console.error("DEBUGGING REGISTRATION:", error); // Check your browser console for this!
  
  const errorMessage = error.response?.data?.message || 
                       error.response?.data?.error || 
                       error.message || 
                       "Registration failed";

  toast({
    variant: "destructive",
    title: "Registration Error",
    description: errorMessage
  });
  setIsLoading(false);
}
  };

  // Reusable input style class to match Login page
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all";
  const labelClass = "block font-subheading text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="flex min-h-screen font-subheading">
      {/* Left Side - 3D Visual (Identical to Login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-700 to-violet-600 relative items-center justify-center p-12 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-tertiary max-w-lg">
          <img
            src="https://raw.createusercontent.com/7ad8eebd-17f3-4e08-99f8-e5b08e5fe2a7/"
            alt="Health Management 3D Illustration"
            className="w-full h-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-bold mb-4 font-heading text-white">
            Join the Network
          </h1>
          <p className="text-lg text-purple-100">
            Register your hospital today. Streamline operations, manage patients, and empower your medical staff with our comprehensive system.
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-xl"> {/* Slightly wider for 2 columns */}
          
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl mb-4 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              {/* Demo Data Button */}
              <button
                type="button"
                onClick={fillDemoData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Fill Demo Data
              </button>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Register Hospital
            </h2>
            <p className="text-gray-600 font-subheading">
              Create your organization account and admin profile
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section: Hospital Info */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wide text-purple-600 font-bold border-b border-gray-100 pb-2">
                Hospital Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="hospitalName" className={labelClass}>Hospital Name</label>
                  <input
                    id="hospitalName" name="hospitalName"
                    required
                    className={inputClass}
                    placeholder="General Hospital..."
                    value={formData.hospitalName} onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="hospitalPhone" className={labelClass}>Phone Number</label>
                  <input
                    id="hospitalPhone" name="hospitalPhone" type="tel"
                    required
                    className={inputClass}
                    placeholder="+234..."
                    value={formData.hospitalPhone} onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="hospitalEmail" className={labelClass}>Official Email</label>
                  <input
                    id="hospitalEmail" name="hospitalEmail" type="email"
                    required
                    className={inputClass}
                    placeholder="info@hospital.com"
                    value={formData.hospitalEmail} onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="hospitalAddress" className={labelClass}>Address</label>
                  <input
                    id="hospitalAddress" name="hospitalAddress"
                    required
                    className={inputClass}
                    placeholder="123 Health Street, Lagos"
                    value={formData.hospitalAddress} onChange={handleChange}
                  />
                </div>

                  <div className="md:col-span-2">
                  <label htmlFor="registrationNumber" className={labelClass}>Registration Number</label>
                  <input
                    id="registrationNumber" name="registrationNumber"
                    required
                    className={inputClass}
                    placeholder="1234"
                    value={formData.registrationNumber} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section: Admin Info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm uppercase tracking-wide text-purple-600 font-bold border-b border-gray-100 pb-2">
                Admin Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminFirstName" className={labelClass}>First Name</label>
                  <input
                    id="adminFirstName" name="adminFirstName"
                    required
                    className={inputClass}
                    placeholder="John"
                    value={formData.adminFirstName} onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="adminLastName" className={labelClass}>Last Name</label>
                  <input
                    id="adminLastName" name="adminLastName"
                    required
                    className={inputClass}
                    placeholder="Doe"
                    value={formData.adminLastName} onChange={handleChange}
                  />
                </div>

    {/* Email - Full Width */}
    <div className="md:col-span-2">
      <label htmlFor="adminEmail" className={labelClass}>Admin Email (Login ID)</label>
      <input
        id="adminEmail" name="adminEmail" type="email"
        required
        className={inputClass}
        placeholder="janet.abdullahi@hospital.com"
        value={formData.adminEmail} onChange={handleChange}
      />
    </div>

    {/* Password */}
    <div className="md:col-span-1">
      <label htmlFor="adminPassword" className={labelClass}>Password</label>
      <div className="relative">
        <input
          id="adminPassword" name="adminPassword"
          type={showPassword ? "text" : "password"}
          required minLength={8}
          className={`${inputClass} pr-12`} // Added padding for the icon
          placeholder="••••••••"
          value={formData.adminPassword} onChange={handleChange}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type="password"
                    required
                    className={inputClass}
                    placeholder="••••••••"
                    value={formData.confirmPassword} onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg shadow-purple-500/30 font-heading flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <> <Loader2 className="h-5 w-5 animate-spin" /> Creating Account... </>
              ) : (
                <> Create Account <ArrowRight className="h-5 w-5" /> </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
