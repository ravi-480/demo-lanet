import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoute";
import vendorRoutes from "./routes/vendorRoutes";
import { errorConverter, errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
); // Enable CORS
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/vendors", vendorRoutes);

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
