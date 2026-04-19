import { Router } from "express";
import mongoose from "mongoose";
import { generateInvoicePdf } from "../services/invoiceService.js";
import { notifyOrderStatusChange } from "../services/notificationService.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";
import {
  canTransition,
  createStatusTimelineEntry,
  getStatusFromAction,
  normalizeOrderStatus,
  normalizePaymentMethod,
  normalizePaymentStatus,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  statusLabel
} from "../utils/orderWorkflow.js";

const router = Router();

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=2400&h=1600&auto=format&fit=crop";

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

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePhone(value) {
  return parseString(value).replace(/\D/g, "");
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOrderItems(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("At least one item is required.");
  }

  const items = value
    .map((item) => {
      const name = parseString(item?.name);
      const productId = parseString(item?.productId || item?.id);
      const image = parseString(item?.image);
      const qty = Number.parseInt(String(item?.qty ?? item?.quantity), 10);
      const price = parseNumber(item?.price);

      if (!name || !Number.isFinite(qty) || qty <= 0 || price === null || price < 0) {
        return null;
      }

      return {
        productId,
        name,
        image,
        qty,
        quantity: qty,
        price: Math.round(price),
        lineTotal: Math.round(price * qty)
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    throw new Error("At least one valid order item is required.");
  }

  return items;
}

function computeOrderTotals(items, providedShipping) {
  const subtotal = items.reduce((sum, item) => sum + Number(item?.lineTotal || 0), 0);

  const shippingAmount = Number.isFinite(providedShipping)
    ? Math.max(0, Math.round(providedShipping))
    : subtotal === 0
      ? 0
      : subtotal >= 5000
        ? 0
        : 299;

  return {
    subtotal,
    shippingAmount,
    totalAmount: subtotal + shippingAmount
  };
}

async function findOrderByIdentifier(identifier) {
  const value = parseString(identifier);

  if (!value) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await Order.findById(value);
    if (byId) {
      return byId;
    }
  }

  return Order.findOne({
    $or: [{ orderId: value }, { orderNumber: value }]
  });
}

function buildOrderSearchQuery(params) {
  const statusRaw = parseString(params.status).toLowerCase();
  const delayed = parseString(params.delayed).toLowerCase() === "true";
  const paymentStatusRaw = parseString(params.paymentStatus).toUpperCase();
  const search = parseString(params.q || params.search);

  const query = {};

  if (statusRaw === "pending") {
    query.orderStatus = {
      $in: ["placed", "confirmed", "packed", "shipped", "out_for_delivery"]
    };
  } else if (statusRaw && statusRaw !== "all") {
    const normalizedStatus = normalizeOrderStatus(statusRaw, "");
    if (normalizedStatus) {
      query.orderStatus = normalizedStatus;
    }
  }

  if (paymentStatusRaw && PAYMENT_STATUS_VALUES.includes(paymentStatusRaw)) {
    query.paymentStatus = paymentStatusRaw;
  }

  if (delayed) {
    query.expectedDeliveryAt = { $lt: new Date() };

    if (!query.orderStatus) {
      query.orderStatus = { $nin: ["delivered", "cancelled"] };
    }
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { orderId: regex },
      { orderNumber: regex },
      { customerName: regex },
      { phone: regex }
    ];
  }

  return query;
}

function listAllowedTransitions(status) {
  const current = normalizeOrderStatus(status);

  if (current === "delivered" || current === "cancelled") {
    return [];
  }

  const transitions = [];

  if (current === "placed") {
    transitions.push("confirmed", "cancelled");
  }

  if (current === "confirmed") {
    transitions.push("packed", "cancelled");
  }

  if (current === "packed") {
    transitions.push("shipped", "cancelled");
  }

  if (current === "shipped") {
    transitions.push("out_for_delivery", "cancelled");
  }

  if (current === "out_for_delivery") {
    transitions.push("delivered", "cancelled");
  }

  return transitions;
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

router.get("/orders", requireAdminAuth, async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 12), 60);
    const skip = (page - 1) * limit;
    const query = buildOrderSearchQuery(req.query || {});

    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query)
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/orders/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
});

router.put("/orders/:id/status", requireAdminAuth, async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const action = parseString(req.body?.action);
    const explicitStatus = parseString(req.body?.orderStatus);

    const currentStatus = normalizeOrderStatus(order.orderStatus);
    const nextStatus = explicitStatus
      ? normalizeOrderStatus(explicitStatus, "")
      : getStatusFromAction(action, "");

    if (!nextStatus || !ORDER_STATUS_VALUES.includes(nextStatus)) {
      return res.status(400).json({ message: "Provide a valid status update action." });
    }

    if (!canTransition(currentStatus, nextStatus)) {
      return res.status(400).json({
        message: `Cannot move order from ${statusLabel(currentStatus)} to ${statusLabel(nextStatus)}.`,
        allowedTransitions: listAllowedTransitions(currentStatus)
      });
    }

    order.orderStatus = nextStatus;

    if (nextStatus === "delivered" && order.paymentMethod === "COD" && order.paymentStatus === "PENDING") {
      order.paymentStatus = "PAID";
    }

    order.statusTimeline.push(createStatusTimelineEntry(nextStatus));
    await order.save({ validateModifiedOnly: true });

    const notificationResult = await notifyOrderStatusChange(order.toJSON());

    if (notificationResult?.email) {
      order.notificationLog.push({
        status: nextStatus,
        channel: "email",
        sent: Boolean(notificationResult.email.sent),
        details: notificationResult.email.error || notificationResult.email.reason || ""
      });
    }

    if (notificationResult?.whatsapp) {
      order.notificationLog.push({
        status: nextStatus,
        channel: "whatsapp",
        sent: Boolean(notificationResult.whatsapp.sent),
        details: notificationResult.whatsapp.error || notificationResult.whatsapp.reason || ""
      });
    }

    if (Array.isArray(order.notificationLog) && order.notificationLog.length > 0) {
      await order.save({ validateModifiedOnly: true });
    }

    return res.json({
      order,
      notifications: notificationResult
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});

router.put("/orders/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const payload = req.body || {};

    if (hasOwn(payload, "customerName")) {
      const customerName = parseString(payload.customerName);
      if (!customerName) {
        return res.status(400).json({ message: "Customer name cannot be empty." });
      }
      order.customerName = customerName;
    }

    if (hasOwn(payload, "phone")) {
      const phone = normalizePhone(payload.phone);
      if (!phone) {
        return res.status(400).json({ message: "Phone cannot be empty." });
      }
      order.phone = phone;
    }

    if (hasOwn(payload, "email")) {
      const email = parseString(payload.email).toLowerCase();
      if (!email) {
        return res.status(400).json({ message: "Email cannot be empty." });
      }
      order.email = email;
    }

    if (hasOwn(payload, "address") && payload.address && typeof payload.address === "object") {
      const nextAddress = {
        line1: parseString(payload.address.line1 ?? order.address?.line1),
        line2: parseString(payload.address.line2 ?? order.address?.line2),
        city: parseString(payload.address.city ?? order.address?.city),
        state: parseString(payload.address.state ?? order.address?.state),
        postalCode: parseString(payload.address.postalCode ?? order.address?.postalCode)
      };

      if (!nextAddress.line1 || !nextAddress.city || !nextAddress.state || !nextAddress.postalCode) {
        return res.status(400).json({ message: "Address must include line1, city, state, and postalCode." });
      }

      order.address = nextAddress;
    }

    if (hasOwn(payload, "paymentMethod")) {
      order.paymentMethod = normalizePaymentMethod(payload.paymentMethod, order.paymentMethod);
    }

    if (hasOwn(payload, "paymentStatus")) {
      order.paymentStatus = normalizePaymentStatus(payload.paymentStatus, order.paymentStatus);
    }

    if (hasOwn(payload, "trackingId")) {
      const trackingId = parseString(payload.trackingId);
      if (!trackingId) {
        return res.status(400).json({ message: "Tracking ID cannot be empty." });
      }
      order.trackingId = trackingId;
    }

    if (hasOwn(payload, "expectedDeliveryAt")) {
      const expectedDeliveryAt = parseDate(payload.expectedDeliveryAt);
      order.expectedDeliveryAt = expectedDeliveryAt;
    }

    if (hasOwn(payload, "notes")) {
      order.notes = parseString(payload.notes);
    }

    if (hasOwn(payload, "items")) {
      const items = parseOrderItems(payload.items);
      const shippingInput = parseNumber(payload.shippingAmount ?? order.shippingAmount);
      const totals = computeOrderTotals(items, shippingInput);

      order.items = items;
      order.subtotal = totals.subtotal;
      order.shippingAmount = totals.shippingAmount;
      order.totalAmount = totals.totalAmount;
    }

    if (hasOwn(payload, "orderStatus")) {
      const nextStatus = normalizeOrderStatus(payload.orderStatus, order.orderStatus);

      if (!canTransition(order.orderStatus, nextStatus)) {
        return res.status(400).json({
          message: `Cannot move order from ${statusLabel(order.orderStatus)} to ${statusLabel(nextStatus)}.`,
          allowedTransitions: listAllowedTransitions(order.orderStatus)
        });
      }

      if (nextStatus !== order.orderStatus) {
        order.orderStatus = nextStatus;
        order.statusTimeline.push(createStatusTimelineEntry(nextStatus));
      }
    }

    await order.save({ validateModifiedOnly: true });

    return res.json({ order });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});

router.get("/orders/:id/invoice", requireAdminAuth, async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const pdfBuffer = await generateInvoicePdf(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${order.orderId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
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
