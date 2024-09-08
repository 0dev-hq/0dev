import dotenv from "dotenv";
dotenv.config(); // This should be here

import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import authRoutes from "./routes/auth";
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

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
