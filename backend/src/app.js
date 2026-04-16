import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import authRoutes from "./routes/auth.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import facilityRoutes from "./routes/facility.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import bloodLabRoutes from "./routes/blood-lab.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import campRoutes from "./routes/camp.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import sanitizeRequest from "./middleware/sanitize.middleware.js";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(sanitizeRequest);
app.use(hpp());
app.use("/api", apiLimiter);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Blood donation API is running",
    appName: "blood-bank-management-system",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/facility", facilityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blood-lab", bloodLabRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/camps", campRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
