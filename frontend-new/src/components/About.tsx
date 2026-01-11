const teamMembers = [
  "Laura Chiedu",
  "Kosisochukwu Nebolisa",
  "Oluwafunbi Onaeko",
  "Ugochukwu Nwodo",
  "Precious Uwadone",
  "Oluwawemimo Olaywola",
  "Moses Onaolapo",
  "Carissa Umoh",
  "Sorito Onodingene",
  "NnasoGdem Anike-Nweze",
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            About <span className="text-primary">HealthSync</span>
          </h2>
          <p className="text-muted-foreground">
            What you need to know about our project
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Overview Card */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="text-xl font-semibold text-primary mb-4">Overview</h3>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p>
                HealthSync is an AI-powered hospital workflow platform designed to
                simplify and unify the entire patient care journey. From patient
                registration to medication dispensing, it ensures that every
                appointment follows a single, continuous pipeline.
              </p>
              <p>
                Built with real hospital workflows in mind, the system prioritizes speed,
                accuracy, and clarity for healthcare professionals.
              </p>
            </div>
          </div>

          {/* Team Card */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="text-xl font-semibold text-primary mb-4">Our Team</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground text-sm">
              {teamMembers.map((member) => (
                <li key={member}>• {member}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;