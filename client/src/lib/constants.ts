/**
 * Application-wide constants.
 */

export const APP_NAME = "Data Analytics Platform";

export const APP_DESCRIPTION =
  "Upload, clean, visualize, and gain AI-powered insights from your data.";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const ROUTES = {
  HOME: "/",
  UPLOAD: "/upload",
  DATASET: "/dataset",
  DASHBOARD: "/dashboard",
  REPORT: "/report",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];


