import { Link } from "react-router-dom";
import {
  BarChart3,
  FileUp,
  Sparkles,
  FileText,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import { APP_NAME, APP_DESCRIPTION, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Feature card displayed on the home page.
 */
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps): JSX.Element {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Technology badge displayed in the stack section.
 */
interface TechBadgeProps {
  name: string;
  category: string;
}

function TechBadge({ name, category }: TechBadgeProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/50 px-4 py-3">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{category}</span>
    </div>
  );
}

/**
 * Home page — landing page with hero, features, and tech stack.
 */
export function HomePage(): JSX.Element {
  const features = [
    {
      icon: FileUp,
      title: "Upload & Parse",
      description:
        "Drag and drop CSV or Excel files. Automatic parsing with intelligent type detection.",
    },
    {
      icon: Shield,
      title: "Auto Clean",
      description:
        "Detect missing values, duplicate rows, and incorrect data types with one click.",
    },
    {
      icon: BarChart3,
      title: "Visualize",
      description:
        "Build interactive dashboards with bar, line, pie, scatter, and heatmap charts.",
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description:
        "Generate AI-powered summaries, trend analysis, and anomaly detection.",
    },
    {
      icon: FileText,
      title: "Export Reports",
      description:
        "Download professional PDF reports with charts, insights, and data summaries.",
    },
    {
      icon: Zap,
      title: "Fast & Modern",
      description:
        "Built with React 18, FastAPI, and Tailwind CSS for a snappy, modern experience.",
    },
  ];

  const techStack = [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Vite", category: "Build" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "shadcn/ui", category: "Components" },
    { name: "TanStack Query", category: "Data Fetching" },
    { name: "FastAPI", category: "Backend" },
    { name: "Python", category: "Language" },
    { name: "Pandas", category: "Data Processing" },
    { name: "SQLite", category: "Database" },
    { name: "Gemini API", category: "AI" },
    { name: "Playwright", category: "PDF" },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 pt-8 text-center md:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          Portfolio Project — Stage 1
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          {APP_NAME}
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          {APP_DESCRIPTION}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={ROUTES.UPLOAD}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3",
              "text-sm font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90"
            )}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={ROUTES.DASHBOARD}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3",
              "text-sm font-medium transition-colors hover:bg-accent"
            )}
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Everything You Need
          </h2>
          <p className="mt-2 text-muted-foreground">
            A complete data analytics pipeline from upload to insight.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Built With Modern Tech
          </h2>
          <p className="mt-2 text-muted-foreground">
            Carefully chosen tools for performance and developer experience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {techStack.map((tech) => (
            <TechBadge key={tech.name} {...tech} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl border border-border bg-muted/30 p-8 text-center md:p-12">
        <TrendingUp className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ready to Analyze Your Data?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Upload your first dataset and start exploring patterns, cleaning issues, and generating insights.
        </p>
        <div className="mt-6">
          <Link
            to={ROUTES.UPLOAD}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3",
              "text-sm font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90"
            )}
          >
            Upload Your Data
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>
          {APP_NAME} — A portfolio project built with React 18, FastAPI, and Tailwind CSS.
        </p>
        <p className="mt-1">Stage 1 — Foundation & UI Shell</p>
      </footer>
    </div>
  );
}

