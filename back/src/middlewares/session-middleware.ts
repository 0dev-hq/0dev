import session from "express-session";

declare module "express-session" {
  interface SessionData {
    returnTo?: string; // Add the returnTo property
  }
}

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key", // Use an environment variable for security
  resave: false, // Prevent session resaving if not modified
  saveUninitialized: true, // Save sessions even if they’re new and not modified
  cookie: {
    secure: process.env.NODE_ENV === "production", // Use secure cookies only in production (HTTPS)
    maxAge: 1000 * 60 * 60 * 24, // Set cookie expiration (e.g., 1 day)
  },
});
