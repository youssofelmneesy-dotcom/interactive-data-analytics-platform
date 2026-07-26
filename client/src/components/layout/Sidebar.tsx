import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileUp,
  Database,
  LayoutDashboard,
  FileText,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Home", path: ROUTES.HOME, icon: Home },
  { label: "Upload", path: ROUTES.UPLOAD, icon: FileUp },
  { label: "Datasets", path: ROUTES.DATASET, icon: Database },
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Reports", path: ROUTES.REPORT, icon: FileText },
];

export function Sidebar(): JSX.Element {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="flex h-14 items-center border-b border-border px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-semibold tracking-tight">Platform</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">v0.1.0 — Stage 6</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

