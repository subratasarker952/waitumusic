import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log("✅ WaituMusic app mounted successfully");
  } catch (error) {
    console.error("❌ Failed to render app:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    rootElement.innerHTML = `<h1>Error: ${errorMessage}</h1>`;
  }
} else {
  console.error("❌ No root element found");
}
