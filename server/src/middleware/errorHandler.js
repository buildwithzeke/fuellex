import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  console.error("Error caught by errorHandler:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    const issues = err.issues || err.errors || [];
    message = issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
  }

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate email)
    if (err.code === "P2002") {
      statusCode = 400;
      const fields = err.meta?.target ? err.meta.target.join(", ") : "field";
      message = `A record with this ${fields} already exists`;
    }
    // Record not found
    if (err.code === "P2025") {
      statusCode = 404;
      message = err.meta?.cause || "Record not found";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
