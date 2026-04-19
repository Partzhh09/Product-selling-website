import crypto from "crypto";
import { Router } from "express";
import User from "../models/User.js";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10,15}$/;

function parseString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizePhone(value) {
  return parseString(value).replace(/\D/g, "");
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
}

function verifyPassword(password, salt, expectedHash) {
  const incomingHash = hashPassword(password, salt);
  const incomingBuffer = Buffer.from(incomingHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (incomingBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(incomingBuffer, expectedBuffer);
}

function sanitizeUser(user) {
  return {
    id: String(user.id || user._id || ""),
    fullName: String(user.fullName || ""),
    email: String(user.email || ""),
    phone: String(user.phone || ""),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt
  };
}

router.post("/signup", async (req, res, next) => {
  try {
    const fullName = parseString(req.body?.fullName);
    const email = parseString(req.body?.email).toLowerCase();
    const phone = normalizePhone(req.body?.phone);
    const password = parseString(req.body?.password);

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid phone number." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password should be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "An account already exists with this email address." });
    }

    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, passwordSalt);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      passwordSalt
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account already exists with this email address." });
    }

    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = parseString(req.body?.email).toLowerCase();
    const password = parseString(req.body?.password);

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in both email and password." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login successful.",
      token: crypto.randomBytes(24).toString("hex"),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/profile/:id", async (req, res, next) => {
  try {
    const userId = parseString(req.params?.id);

    if (!userId) {
      return res.status(400).json({ message: "User id is required." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const payload = req.body || {};

    if (hasOwn(payload, "fullName")) {
      const fullName = parseString(payload.fullName);

      if (!fullName) {
        return res.status(400).json({ message: "Full name cannot be empty." });
      }

      user.fullName = fullName;
    }

    if (hasOwn(payload, "email")) {
      const email = parseString(payload.email).toLowerCase();

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      const existing = await User.findOne({ email });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ message: "An account already exists with this email address." });
      }

      user.email = email;
    }

    if (hasOwn(payload, "phone")) {
      const phone = normalizePhone(payload.phone);

      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Please enter a valid phone number." });
      }

      user.phone = phone;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account already exists with this email address." });
    }

    return next(error);
  }
});

export default router;
