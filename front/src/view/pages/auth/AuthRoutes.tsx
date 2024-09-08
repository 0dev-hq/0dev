import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUpPage from './SignUpPage';
import SignInPage from './SignInPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AuthCallbackPage from './AuthCallbackPage';
import ConfirmEmailPage from './ConfirmEmailPage';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="signup" element={<SignUpPage />} />
      <Route path="signin" element={<SignInPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="callback" element={<AuthCallbackPage />} /> 
      <Route path="/confirm-email/:token" element={<ConfirmEmailPage />} />
      <Route path="*" element={<SignInPage />} />
    </Routes>
  );
};

export default AuthRoutes;
