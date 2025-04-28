import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectDB from "../config/db";
import { initializeSocketIO } from "../utils/socketUtils";
import app from "../app";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initializeSocketIO(server);

// Start server
server.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION!  Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
