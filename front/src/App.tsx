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
import NewQueryPage from "./view/pages/NewQueryPage";
import RunQueryPage from "./view/pages/RunQueryPage";
import ReportCanvasPage from "./view/pages/ReportCanvasPage";
import ReportViewPage from "./view/pages/ReportViewPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
import AccountPage from "./view/pages/AccountPage";

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
                <Route path="data-source" element={<DataSourcesPage />} />
                <Route path="data-source/new" element={<NewDataSourcePage />} />
                <Route
                  path="data-source/edit/:id"
                  element={<NewDataSourcePage />}
                />
                <Route path="query" element={<QueriesPage />} />
                <Route path="query/new" element={<NewQueryPage />} />
                <Route path="query/edit/:id" element={<NewQueryPage />} />
                <Route path="query/run" element={<RunQueryPage />} />
                <Route path="report" element={<ReportsPage />} />
                <Route path="report/new" element={<ReportCanvasPage />} />
                <Route path="report/edit/:id" element={<ReportCanvasPage />} />
                <Route path="report/view/:id" element={<ReportViewPage />} />
                <Route path="account" element={<AccountPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
        <ToastContainer />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
