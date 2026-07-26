import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: ROUTES.HOME },
    { label: "Upload", path: ROUTES.UPLOAD },
    { label: "Datasets", path: ROUTES.DATASET },
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Reports", path: ROUTES.REPORT },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
          <BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md",
                location.pathname === link.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pl-2 border-l border-border">
            <ThemeToggle />
          </div>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 md:hidden focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded-md",
                  location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

