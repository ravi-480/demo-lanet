import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import { errorConverter, errorHandler } from "./middleware/errorHandler";

const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow cookies and credentials
  })
); // Enable CORS
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api/auth", authRoutes);

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
