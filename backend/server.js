import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { seedProducts } from "./data/seedProducts.js";
import Product from "./models/Product.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hofo-products-backend",
    uptime: Math.round(process.uptime())
  });
});

app.use("/api/products", productRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Unexpected API error", error);
  res.status(500).json({ message: "Unexpected server error." });
});

async function connectDatabaseAndSeed() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI. Add it in your environment variables.");
  }

  await mongoose.connect(mongoUri);

  const existingCount = await Product.estimatedDocumentCount();

  if (existingCount === 0) {
    await Product.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} products into MongoDB.`);
  }
}

async function startServer() {
  await connectDatabaseAndSeed();

  app.listen(port, () => {
    console.log(`Backend API running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend server", error);
  process.exit(1);
});
