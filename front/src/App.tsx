import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./view/layout/Layout";
import { ProtectedRoute } from "./view/components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "./context/SocketProvider";
import routes from "./routes";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                {routes.unprotected.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  {routes.protected.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={route.element}
                    >
                      {route.children?.map((childRoute) => (
                        <Route
                          key={childRoute.path}
                          path={childRoute.path}
                          element={childRoute.element}
                        />
                      ))}
                    </Route>
                  ))}
                </Route>
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </Router>
        <ToastContainer />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
