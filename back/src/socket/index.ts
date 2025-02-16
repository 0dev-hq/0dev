import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import { setupDanaNamespace } from "./namespace-dana";
import { setupDefaultNamespace } from "./namespace-default";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  setupDefaultNamespace(io);
  setupDanaNamespace(io);

  logger.info("Socket.IO initialized");
};

export const getSocket = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return io;
};
