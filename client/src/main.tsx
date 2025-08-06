import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service worker registration with proper error handling
function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('[SW] Service Worker registration failed:', error);
        });
    });
  }
}

// Global error handlers to prevent unhandled rejections in console
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Global] Unhandled promise rejection:', event.reason);
  // Prevent the default console error
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('[Global] Unhandled error:', event.error);
});

// Initialize service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
