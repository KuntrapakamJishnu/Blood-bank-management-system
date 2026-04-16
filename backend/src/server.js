import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { swaggerDocs, swaggerUi } from "./openapi/index.js";

dotenv.config({ quiet: true });

app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database status: ${dbConnected ? "connected" : "disconnected (dev mode)"}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});