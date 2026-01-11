import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import About from "../components/About";
import Footer from "../components/Footer";

const Index = () => {
  const stats = [
    { value: "50K+", label: "Patients Managed" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "3x", label: "Faster Documentation" },
    { value: "500+", label: "Healthcare Providers" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Stats Section */}
      <section id="stats" className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                {/* UPDATED: 
                   - Used 'from-[hsl(var(--gradient-start))]' to match your CSS variables 
                   - Fallback to 'from-primary' for consistency with your primary purple
                */}
                <p className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-2 font-subheading">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <About />
      <Footer />
    </div>
  );
};

export default Index;