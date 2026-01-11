import { FileText, Shield, Activity, Users, StickyNote } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Patient Records",
    description: "Access and manage patient records with intuitive navigation and real-time updates.",
  },
  {
    icon: Activity,
    title: "Vitals Monitoring",
    description: "Monitor patient vitals with automated data capture from intake sessions.",
  },
  {
    icon: Shield,
    title: "Secure Data",
    description: "Security for sensitive medical data.",
  },
  {
    icon: Users,
    title: "Team Handoffs",
    description: "Seamless handoffs between nurses, doctors, and medical staff.",
  },
  {
    icon: StickyNote,
    title: "Auto-Generated Notes",
    description: "AI-powered transcription converts intake sessions into structured clinical notes.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Everything You Need to{" "}
            <span className="text-primary">Manage Patient Care</span>
          </h2>
          <p className="text-muted-foreground">
            Built by members of our CSC 412 project team. Our platform streamlines
            every step of the documentation process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
