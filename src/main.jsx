// Main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "@material-tailwind/react";
import "../public/css/tailwind.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./Error"; // Import ErrorBoundary

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter> {/* Wrap root component with BrowserRouter */}
    <ErrorBoundary>  {/* Wrap App with ErrorBoundary */}
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </BrowserRouter>
);
