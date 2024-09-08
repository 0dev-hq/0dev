import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./view/layout/Layout";
import AuthRoutes from "./view/pages/auth/AuthRoutes";
import { ProtectedRoute } from "./view/components/ProtectedRoute";
import DataSourcesPage from "./view/pages/DataSourcesPage";
import NewDataSourcePage from "./view/pages/NewDataSourcePage";
import QueriesPage from "./view/pages/QueriesPage";
import ReportsPage from "./view/pages/ReportsPage";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "react-query"; // Added React Query setup
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient(); // Initialize the QueryClient

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Use Vite's import.meta.env */}
      <QueryClientProvider client={queryClient}>
        {/* React Query Provider */}
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes for authentication */}
              <Route path="/auth/*" element={<AuthRoutes />} />

              {/* Protected routes that use the Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Nested routes inside the Layout */}
                <Route path="data-sources" element={<DataSourcesPage />} />
                <Route path="new-data-source" element={<NewDataSourcePage />} />
                <Route path="queries" element={<QueriesPage />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
