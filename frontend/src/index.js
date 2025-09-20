import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Comprehensive ResizeObserver error suppression - suppress both console and visual overlay
if (typeof window !== 'undefined') {
  // Pattern to match ResizeObserver errors
  const resizeObserverErr = /^(ResizeObserver loop (completed with undelivered notifications|limit exceeded)|ResizeObserver loop)/;
  
  // Suppress console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
      return; // Suppress ResizeObserver errors
    }
    originalConsoleError.apply(console, args);
  };

  // Suppress console warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
      return; // Suppress ResizeObserver warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  // Handle window error events (critical for visual overlay)
  window.addEventListener('error', (e) => {
    if (e.message && resizeObserverErr.test(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true); // Use capture phase

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && typeof e.reason === 'string' && resizeObserverErr.test(e.reason)) {
      e.preventDefault();
      return false;
    }
  });

  // Override window.onerror to prevent visual overlays
  const originalOnError = window.onerror;
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (msg && resizeObserverErr.test(msg)) {
      return true; // Prevent default error handling
    }
    if (originalOnError) {
      return originalOnError.call(this, msg, url, lineNo, columnNo, error);
    }
    return false;
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
