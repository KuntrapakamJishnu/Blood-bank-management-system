import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./services/api";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected application error",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
          <div className="max-w-lg w-full border border-red-100 rounded-2xl shadow-lg p-6 bg-white">
            <h1 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              We hit an unexpected error while loading the app. Please refresh the page.
            </p>
            {this.state.message ? (
              <p className="text-sm text-gray-500 mb-4">Error: {this.state.message}</p>
            ) : null}
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const mountRoot = () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root container not found");
  }

  createRoot(container).render(
    <StrictMode>
      <AppErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppErrorBoundary>
    </StrictMode>
  );
};

try {
  mountRoot();
} catch (error) {
  console.error("Failed to bootstrap app:", error);
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#ffffff;color:#111827;font-family:Inter,sans-serif;">
        <div style="max-width:560px;width:100%;background:#ffffff;border:1px solid #fee2e2;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.08);padding:24px;">
          <h1 style="margin:0 0 8px;color:#b91c1c;font-size:24px;font-weight:700;">Unable to load app</h1>
          <p style="margin:0 0 14px;color:#374151;">The app failed to start. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="padding:10px 14px;border:none;border-radius:10px;background:#dc2626;color:white;font-weight:600;cursor:pointer;">Reload Page</button>
        </div>
      </div>
    `;
  }
}