import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  showBack = true,
  backHref,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backHref) {
      navigate(backHref);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6">
      {/* Breadcrumbs - hidden on small screens */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground mb-3 flex-wrap">
          <Link
            to="/admin/dashboard"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
