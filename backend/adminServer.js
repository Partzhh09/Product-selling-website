import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const port = Number(process.env.ADMIN_PORT) || 5001;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/admin/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hofo-admin-backend",
    uptime: Math.round(process.uptime())
  });
});

app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Unexpected admin API error", error);
  res.status(500).json({ message: "Unexpected server error." });
});

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI. Add it in your environment variables.");
  }

  await mongoose.connect(mongoUri);
}

async function startAdminServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Admin API running at http://localhost:${port}`);
  });
}

startAdminServer().catch((error) => {
  console.error("Failed to start admin backend server", error);
  process.exit(1);
});
