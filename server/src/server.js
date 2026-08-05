import dotenv from "dotenv";
// Load env vars before importing anything else
dotenv.config();

import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    // Check database connection on startup
    console.log("Checking database connection...");
    await prisma.$connect();
    console.log("Database connection established successfully.");

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failure. Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
