import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toaster";
import { Toaster } from "@/components/ui/Toaster";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ErrorFallback } from "@/components/error/ErrorFallback";
import { SkipLink } from "@/components/ui/SkipLink";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomePage } from "@/pages/HomePage";
import { UploadPage } from "@/pages/UploadPage";
import { DatasetPage } from "@/pages/DatasetPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ReportPage } from "@/pages/ReportPage";
import { ROUTES } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App(): JSX.Element {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <SkipLink />
              <Routes>
                <Route element={<PageLayout />}>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
                  <Route path={ROUTES.DATASET} element={<DatasetPage />} />
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={ROUTES.REPORT} element={<ReportPage />} />
                </Route>
              </Routes>
              <Toaster />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

