import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary",
          theme === "light"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary",
          theme === "system"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Use system color preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary",
          theme === "dark"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}

