// jwt auth middleware for socket.io

import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export const jwtAuthMiddleware = (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
};
