import { Server } from "socket.io";
import logger from "../utils/logger";
import { sharedSecretMiddleware } from "./shared-secret-middleware";

type JobBaseData = {
  account_id: string;
  session_id: string;
  agent_id: string;
  job_id: string;
};

const getJobRoom = (data: JobBaseData) => {
  return `${data.account_id}:dana:job-update:${data.agent_id}:${data.session_id}`;
};

export const setupDanaNamespace = (io: Server) => {
  const danaNamespace = io.of("/dana");

  io.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
  });

  danaNamespace.use((socket, next) => {
    logger.info(
      `New connection attempt to dana from ${socket.handshake.address}`
    );
    next();
  });

  danaNamespace.use(sharedSecretMiddleware(process.env.DANA_SIO_SECRET!));

  danaNamespace.on("connection", (socket) => {
    logger.info("Dana connected");

    socket.on("job_created", (data: JobBaseData) => {
      const room = getJobRoom(data);
      logger.info(`Sending job_created to ${room}`);
      io.of("/general").to(room).emit("job_created", data);
    });

    socket.on("job_failed", (data: JobBaseData & { error: string }) => {
      logger.info("Job failed", data);
      const room = getJobRoom(data);
      console.log("room", room);
      io.of("/general").to(room).emit("job_failed", data);
    });

    socket.on("job_completed", (data: JobBaseData & { result: any }) => {
      const room = getJobRoom(data);
      io.of("/general").to(room).emit("job_completed", data);
    });

    socket.on("job_scheduled", (data: JobBaseData) => {
      const room = getJobRoom(data);
      danaNamespace.to(room).emit("job_scheduled", data);
    });

    socket.on("disconnect", () => {
      logger.info("Dana disconnected");
    });
  });

  logger.info("Dana namespace initialized");
};
