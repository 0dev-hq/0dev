import dotenv from "dotenv";
dotenv.config(); // This should be here

import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import authRoutes from "./routes/auth";
import dataSourceRoutes from "./routes/dataSource";
import queryRoutes from "./routes/queryRoutes";
import reportRoutes from "./routes/reportRoutes";
import accountRoutes from "./routes/accountRoutes";

import "./config/passport"; // Initialize passport strategies
import { sessionMiddleware } from "./middlewares/sessionMiddleware";

// Load environment variables from .env file

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration (example: allowing requests from a specific frontend URL)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow only the frontend URL defined in the .env file
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
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error(
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

// Root route for testing the server
app.get("/", (req, res) => {
  res.send(
    "Hello, TypeScript with Express, Mongoose, Passport.js, and Nodemailer with SES!"
  );
});

// Authentication routes (login, signup, OAuth)
app.use("/auth", authRoutes);

// Mount other routes under '/api/'
app.use("/api/data-source", dataSourceRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/account", accountRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// TODO: Check if we have to keep it or let it crash (ideally in a dockerized environment with proper health check)

// Handle unhandled rejections (like failed MongoDB connection)
process.on("unhandledRejection", (reason: any, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

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
  console.error("Uncaught Exception:", err);

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
