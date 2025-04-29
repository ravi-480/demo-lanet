import mongoose from "mongoose";

const connectDB = async (retries = 5): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri && process.env.NODE_ENV === "production") {
    console.error(
      "MONGO_URI environment variable is not defined in production!"
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(
      mongoUri || "mongodb://localhost:27017/EventWise",
      {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        // Always use TLS for Atlas connections regardless of environment
        tls: true,
        tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production",
      }
    );

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    if (retries > 0) {
      console.log(`MongoDB connection retry (${retries} attempts left)...`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      if (error instanceof Error) {
        console.error(`MongoDB connection failed: ${error.message}`);
      } else {
        console.error("MongoDB connection failed with unknown error");
      }
      process.exit(1);
    }
  }
};

export default connectDB;
