import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NavGroupProps {
  item: any;
  onNavigate?: () => void;
}

const NavGroup = ({ item, onNavigate }: NavGroupProps) => {
  const { pathname } = useLocation();
  const hasActiveChild = item.children?.some((child: any) => pathname === child.path);
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 rounded-xl text-purple-200 hover:bg-purple-800 hover:text-white transition-all font-medium group"
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5 text-purple-300 group-hover:text-white" />
          <span className="text-sm">{item.name}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="ml-9 space-y-1 border-l-2 border-purple-700 pl-2">
          {item.children.map((child: any) => {
            const isActive = pathname === child.path;
            return (
              <Link
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "text-white font-bold bg-purple-600"
                    : "text-purple-300 hover:text-white hover:bg-purple-800"
                }`}
              >
                {child.icon && <child.icon className="h-4 w-4" />}
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavGroup;
