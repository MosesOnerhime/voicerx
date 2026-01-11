const steps = [
  {
    step: "01",
    title: "Patient Intake",
    description: "Nurse captures symptoms and vitals",
  },
  {
    step: "02",
    title: "Record Review",
    description: "Doctor reviews intake notes",
  },
  {
    step: "03",
    title: "Diagnosis Entry",
    description: "Add diagnosis and treatment plan",
  },
  {
    step: "04",
    title: "Approval",
    description: "Finalize and approve medical record",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            A seamless workflow from patient intake to approved medical records
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.step}
              className="p-6 bg-card rounded-xl border border-border"
            >
              <div className="text-3xl font-bold text-primary/20 mb-3">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
