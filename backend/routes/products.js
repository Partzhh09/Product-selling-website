import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const query = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: regex },
        { desc: regex },
        { category: regex },
        { wood: regex },
        { story: regex }
      ];
    }

    const items = await Product.find(query).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found." });
    }

    const item = await Product.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ item });
  } catch (error) {
    return next(error);
  }
});

export default router;
