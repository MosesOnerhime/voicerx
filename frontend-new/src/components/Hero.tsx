import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className=" min-h-screen flex items-center justify-center bg-secondary/30 pt-40">
      {/* Content */}
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8">
            <span className="text-primary font-medium text-sm">
              Healthcare Management System
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Simplify Your{" "}
            <span className="text-primary">Medical Workflow</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Streamline patient records, appointments, and healthcare operations 
            with our intuitive platform.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Navigates to Sign In */}
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/signin")}
              className="w-full sm:w-auto px-8"
            >
              Sign In
            </Button>

            {/* Navigates to Sign Up / Get Started */}
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-8 bg-[#390C87] hover:bg-[#2a0963]"
            >
              Get Started
            </Button>
          </div>
        </div>
      
            {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-sm text-muted-foreground">MediFlow Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Pending Reviews", value: "12", color: "text-amber-600" },
                    { label: "Approved Today", value: "28", color: "text-green-600" },
                    { label: "Total Patients", value: "156", color: "text-healthcare-purple" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-foreground">Recent Patients</span>
                    <span className="text-sm text-healthcare-purple">View All →</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Johnson", status: "Pending Review", badge: "bg-amber-100 text-amber-700" },
                      { name: "Michael Chen", status: "Approved", badge: "bg-green-100 text-green-700" },
                      { name: "Emily Davis", status: "Updated", badge: "bg-blue-100 text-blue-700" }
                    ].map((patient, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="text-foreground">{patient.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.badge}`}>
                          {patient.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
    </section>
  );
};

export default Hero;
