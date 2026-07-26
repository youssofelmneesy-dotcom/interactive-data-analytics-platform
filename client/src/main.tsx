import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import "@/index.css";

/**
 * Application entry point.
 * Renders the root App component into the DOM.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Ensure index.html contains a div with id='root'.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
