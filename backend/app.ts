import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import sanitize from "express-mongo-sanitize";
// @ts-ignore
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoute";
import vendorRoutes from "./routes/vendorRoutes";
import notificationRoute from "./routes/notificationRoute";
import rsvpRoutes from "./routes/rsvpRoutes";
import { errorConverter, errorHandler } from "./middleware/errorHandler";

const app = express();
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  message: "Too many request please try again later",
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(sanitize());
// app.use(xss());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/notifications", notificationRoute);
app.use("/api/guest", rsvpRoutes);

// 404 Handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorConverter);
app.use(errorHandler);

export default app;
