import { Server, Socket } from "socket.io";
import { jwtAuthMiddleware } from "./jwt-auth-middleware";
import logger from "../utils/logger";

export const setupDefaultNamespace = (io: Server) => {
  const generalNamespace = io.of("/general");

  generalNamespace.use(jwtAuthMiddleware);
  generalNamespace.use((socket, next) => {
    logger.info(
      `New connection attempt to general nsp from ${socket.handshake.address}`
    );
    next();
  });
  generalNamespace.on("connection", (socket: Socket) => {
    logger.debug(`Client connected: ${socket.id}`);
    // show the number of clients connected to the general namespace
    logger.info(
      `Number of clients connected to general namespace: ${generalNamespace.sockets.size}`
    );

    const account = socket.data.user.account;
    socket.on("join_room", (room: string) => {
      const toJoin = `${account}:${room}`;
      socket.join(toJoin);

      logger.info(`Client ${socket.id} joined room ${toJoin}`);
    });

    socket.on("leave_room", (room: string) => {
      const toJoin = `${account}:${room}`;
      socket.leave(toJoin);
      logger.info(`Client ${socket.id} left room ${toJoin}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
      logger.info(
        `Number of clients connected to general namespace: ${generalNamespace.sockets.size}`
      );
    });
  });

  logger.info("Default namespace initialized");
};
