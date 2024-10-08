import session from "express-session";

// Extend the SessionData interface of express-session
declare module "express-session" {
  interface SessionData {
    returnTo?: string; // Add the returnTo property
    invitationToken?: string; // Add the invitationToken property
  }
}
