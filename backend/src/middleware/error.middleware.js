import ApiError from "../errors/api-error.js";

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    details: err.details || undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
