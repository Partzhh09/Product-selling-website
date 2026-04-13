import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1593006526979-4f8f5c6dd6b1?q=80&w=2000&auto=format&fit=crop";

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function parseString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(parseString).filter(Boolean);
}

function parseFaqArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((faq) => ({
      q: parseString(faq?.q),
      a: parseString(faq?.a)
    }))
    .filter((faq) => faq.q && faq.a);
}

function parseSpecs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, val]) => [parseString(key), parseString(val)])
      .filter(([key, val]) => key && val)
  );
}

function buildProductPayload(payload, { partial = false } = {}) {
  const next = {};

  if (!partial || hasOwn(payload, "name")) {
    const name = parseString(payload.name);
    if (!name) {
      throw new Error("Product name is required.");
    }
    next.name = name;
  }

  if (!partial || hasOwn(payload, "desc")) {
    next.desc = parseString(payload.desc);
  }

  if (!partial || hasOwn(payload, "category")) {
    next.category = parseString(payload.category) || "Kitchenware";
  }

  if (!partial || hasOwn(payload, "wood")) {
    next.wood = parseString(payload.wood) || "Teak";
  }

  if (!partial || hasOwn(payload, "story")) {
    next.story = parseString(payload.story);
  }

  if (!partial || hasOwn(payload, "price")) {
    const price = parseNumber(payload.price);
    if (price === null || price < 0) {
      throw new Error("A valid price is required.");
    }
    next.price = Math.round(price);
  }

  if (!partial || hasOwn(payload, "mrp")) {
    const mrp = parseNumber(payload.mrp);
    if (mrp === null || mrp < 0) {
      throw new Error("A valid MRP is required.");
    }
    next.mrp = Math.round(mrp);
  }

  if (
    !partial ||
    hasOwn(payload, "images") ||
    hasOwn(payload, "image") ||
    hasOwn(payload, "imageUrl")
  ) {
    const fromArray = parseStringArray(payload.images);
    const single = parseString(payload.image || payload.imageUrl);
    const uniqueImages = Array.from(new Set([...fromArray, single].filter(Boolean)));

    next.images = uniqueImages.length > 0 ? uniqueImages : [DEFAULT_IMAGE];
  }

  if (!partial || hasOwn(payload, "variants")) {
    const size = parseStringArray(payload?.variants?.size);
    const finish = parseStringArray(payload?.variants?.finish);

    next.variants = {
      size: size.length > 0 ? size : ["Standard"],
      finish: finish.length > 0 ? finish : ["Natural Oil"]
    };
  }

  if (!partial || hasOwn(payload, "specs")) {
    next.specs = parseSpecs(payload.specs);
  }

  if (!partial || hasOwn(payload, "faqs")) {
    next.faqs = parseFaqArray(payload.faqs);
  }

  if (!partial || hasOwn(payload, "discount")) {
    const discount = parseNumber(payload.discount);
    if (discount !== null && discount >= 0) {
      next.discount = Math.round(discount);
    }
  }

  return next;
}

function computeDiscount(mrp, price) {
  if (!Number.isFinite(mrp) || !Number.isFinite(price) || mrp <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((mrp - price) / mrp) * 100));
}

router.post("/login", (req, res) => {
  const expectedSecret = process.env.ADMIN_API_KEY;

  if (!expectedSecret) {
    return res.status(500).json({ message: "ADMIN_API_KEY is not configured on the server." });
  }

  const incomingSecret = parseString(req.body?.secret);

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    return res.status(401).json({ message: "Invalid admin secret." });
  }

  return res.json({
    token: expectedSecret,
    user: {
      role: "admin"
    }
  });
});

router.post("/products", requireAdminAuth, async (req, res, next) => {
  try {
    const payload = buildProductPayload(req.body || {});

    if (payload.mrp < payload.price) {
      payload.mrp = payload.price;
    }

    if (!Number.isFinite(payload.discount)) {
      payload.discount = computeDiscount(payload.mrp, payload.price);
    }

    const item = await Product.create(payload);
    return res.status(201).json({ item });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});

router.put("/products/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found." });
    }

    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found." });
    }

    const payload = buildProductPayload(req.body || {}, { partial: true });

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No valid fields were provided for update." });
    }

    Object.assign(existing, payload);

    if (existing.mrp < existing.price) {
      existing.mrp = existing.price;
    }

    if (!hasOwn(req.body || {}, "discount")) {
      existing.discount = computeDiscount(existing.mrp, existing.price);
    }

    await existing.save();
    return res.json({ item: existing });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});

router.delete("/products/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Product not found." });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ ok: true, id });
  } catch (error) {
    return next(error);
  }
});

export default router;
