import SignUpPage from "@/view/pages/auth/SignUpPage";
import SignInPage from "@/view/pages/auth/SignInPage";
import ForgotPasswordPage from "@/view/pages/auth/ForgotPasswordPage";
import AuthCallbackPage from "@/view/pages/auth/AuthCallbackPage";
import ConfirmEmailPage from "@/view/pages/auth/ConfirmEmailPage";


const authRoutes = [
  { path: "auth/signup", element: <SignUpPage /> },
  { path: "auth/signin", element: <SignInPage /> },
  { path: "auth/forgot-password", element: <ForgotPasswordPage /> },
  { path: "auth/callback", element: <AuthCallbackPage /> },
  { path: "auth/confirm-email/:token", element: <ConfirmEmailPage /> },
  { path: "auth/*", element: <SignInPage /> },
];

export default authRoutes;
