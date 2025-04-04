import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoute";
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
    credentials: true, // ✅ Allow cookies and credentials
  })
); // Enable CORS
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorConverter);
app.use(errorHandler);

export default app;

// JWT_SECRET=my_super_secret_key
// JWT_EXPIRES_IN=7d

// # MongoDB Connection String (Replace with your actual database URI)
// MONGO_URI=mongodb://localhost:27017/your_database_name

// # Server Port (Optional, defaults to 5000)
// PORT=5000

// JWT_ACCESS_SECRET = 8eb877222a26f021a059629d3abb4804e921361e50f6b349e874a69e83d32bd6bc2c246489c2f7eff6ab6951a41b558fbbf5c7a9bc7e5365614021f4b0682fc8
// JWT_REFRESH_SECRET=e5e8ae25e4a1efbb039a81b27bc497f1431869601f64ba9f5105b5c488a56e21
// ACCESS_TOKEN_EXPIRY=15m
// REFRESH_TOKEN_EXPIRY=7d
// # SMTP Configuration
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=465
// EMAIL_SECURE=true
// EMAIL_USERNAME=kumawatravi7983@gmail.com
// EMAIL_PASSWORD=gatm xndd ekke ndsp
// EMAIL_FROM_NAME=EventWise
// EMAIL_FROM_ADDRESS=kumawatravi7983@gmail.com
