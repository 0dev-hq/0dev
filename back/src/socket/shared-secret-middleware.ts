import jwt from "jsonwebtoken";

export const sharedSecretMiddleware = (secret: string) => {
  return (socket: any, next: any) => {
    console.log("sharedSecretMiddleware");
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Unauthorized: No token provided"));
    }

    if (token !== secret) {
      return next(new Error("Unauthorized: Invalid token"));
    }
    next();
  };
};
