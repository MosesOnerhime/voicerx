const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <p className="text-muted-foreground text-sm">
            © HealthSync. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
