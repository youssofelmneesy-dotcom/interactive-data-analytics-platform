import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center animate-in fade-in duration-500",
        className
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

