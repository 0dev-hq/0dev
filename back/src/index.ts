import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config(); // This should be here

import logger from "./utils/logger";

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";

import "./config/passport"; // Initialize passport strategies

import { sessionMiddleware } from "./middlewares/sessionMiddleware";
import { importAndRegisterRoutes } from "./routes/util/routeUtil";

// Initialize Express app
const app: express.Application = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Add timestamp to all schemas in Mongoose
mongoose.plugin((schema) => {
  schema.add({ timestamps: { type: Date, default: Date.now } });
});

const connectWithRetry = () => {
  console.log("Attempting MongoDB connection...");
  mongoose
    .connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      minPoolSize: 10,
      family: 4,
    })
    .then(() => {
      logger.info("Connected to MongoDB");
    })
    .catch((err) => {
      logger.error(
        "Failed to connect to MongoDB, retrying in 5 seconds...",
        err
      );
      setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
    });
};

// Initial connection
connectWithRetry();
// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply the session middleware before passport
app.use(sessionMiddleware);

// Initialize Passport and sessions
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

importAndRegisterRoutes(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// TODO: Check if we have to keep it or let it crash (ideally in a dockerized environment with proper health check)

// Handle unhandled rejections (like failed MongoDB connection)
process.on("unhandledRejection", (reason: any, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);

  // Reconnect if it's a MongoDB connection error
  if (
    reason.name === "MongoNetworkError" ||
    reason.message.includes("MongoNotConnectedError")
  ) {
    console.log("Attempting to reconnect to MongoDB...");
    connectWithRetry();
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);

  // If it's a MongoDB connection error, attempt to reconnect
  if (
    err.name === "MongoNetworkError" ||
    err.message.includes("MongoNotConnectedError")
  ) {
    console.log("Attempting to reconnect to MongoDB...");
    connectWithRetry();
  }

  // Optionally, exit process for other fatal errors
  // process.exit(1);
});
