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

    const account = socket.data.user.account;
    socket.on("join_room", (room: string) => {
      const toJoin = `${account}:${room}`;
      socket.join(toJoin);
      const data = {
        jobId: Date.now().toString(),
        status:
          Math.random() > 0.7
            ? "completed"
            : Math.random() > 0.3
            ? "running"
            : "failed",
        name: `Job ${Math.floor(Math.random() * 1000)}`,
        description: "Simulated job update for demonstration purposes.",
        result:
          Math.random() > 0.5
            ? "Job completed successfully with some sample output."
            : undefined,
        error:
          Math.random() > 0.8
            ? "An error occurred during job execution."
            : undefined,
      };
      io.of("/general").to(toJoin).emit("job_created", data);
      logger.info(`Client ${socket.id} joined room ${toJoin}`);
    });

    socket.on("leave_room", (room: string) => {
      const toJoin = `${account}:${room}`;
      socket.leave(toJoin);
      logger.info(`Client ${socket.id} left room ${toJoin}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info("Default namespace initialized");
};
