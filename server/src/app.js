import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import stationRoutes from "./routes/station.routes.js";
import reportRoutes from "./routes/report.routes.js";
import userRoutes from "./routes/user.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Apply standard global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the FuelLex API server",
  });
});

// Catch-all unhandled routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
