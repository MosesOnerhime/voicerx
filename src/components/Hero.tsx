import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-secondary/30 pt-20">
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
            <Button variant="outline" size="lg">
              Sign In
            </Button>
            <Button size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
