import { Router } from "express";
import { generateInvoicePdf } from "../services/invoiceService.js";
import Order from "../models/Order.js";
import {
  createStatusTimelineEntry,
  getDelayedSuggestion,
  isDelayedOrder,
  normalizeOrderStatus,
  normalizePaymentMethod,
  normalizePaymentStatus,
  statusLabel
} from "../utils/orderWorkflow.js";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10,15}$/;
const postalCodeRegex = /^\d{4,10}$/;

function parseString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseQuantity(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `ORD-${year}${month}${day}-${random}`;
}

function generateTrackingId() {
  const random = String(Math.floor(100000 + Math.random() * 900000));
  return `TRK${random}`;
}

function normalizePhone(value) {
  return parseString(value).replace(/\D/g, "");
}

function normalizePostalCode(value) {
  return parseString(value).replace(/\s+/g, "");
}

function parseAddress(payload) {
  const address = {
    line1: parseString(payload?.line1 || payload?.addressLine1),
    line2: parseString(payload?.line2 || payload?.addressLine2),
    city: parseString(payload?.city),
    state: parseString(payload?.state),
    postalCode: normalizePostalCode(payload?.postalCode)
  };

  if (!address.line1 || !address.city || !address.state || !postalCodeRegex.test(address.postalCode)) {
    throw new Error("Complete shipping address is required.");
  }

  return address;
}

function parseCustomer(payload) {
  const customerName = parseString(payload?.customerName || payload?.name);
  const email = parseString(payload?.email).toLowerCase();
  const phone = normalizePhone(payload?.phone);
  const address = parseAddress(payload?.address || payload);

  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  if (!email || !emailRegex.test(email)) {
    throw new Error("A valid customer email is required.");
  }

  if (!phoneRegex.test(phone)) {
    throw new Error("A valid customer phone number is required.");
  }

  return {
    customerName,
    email,
    phone,
    address
  };
}

function parseItems(value) {
  if (!Array.isArray(value)) {
    throw new Error("Order items are required.");
  }

  const items = value
    .map((item) => {
      const productId = parseString(item?.productId || item?.id);
      const name = parseString(item?.name);
      const image = parseString(item?.image);
      const price = parseNumber(item?.price);
      const qty = parseQuantity(item?.qty ?? item?.quantity);

      if (!name || price === null || price < 0 || qty === null) {
        return null;
      }

      const lineTotal = Math.round(price * qty);

      return {
        productId,
        name,
        image,
        qty,
        quantity: qty,
        price: Math.round(price),
        lineTotal
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    throw new Error("Add at least one valid item to place an order.");
  }

  return items;
}

function computePricing(items, shippingAmount) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const shipping = Number.isFinite(shippingAmount)
    ? Math.max(0, Math.round(shippingAmount))
    : subtotal === 0
      ? 0
      : subtotal >= 5000
        ? 0
        : 299;

  return {
    subtotal,
    shippingAmount: shipping,
    total: subtotal + shipping
  };
}

function parseExpectedDeliveryAt(value) {
  if (!value) {
    const next = new Date();
    next.setDate(next.getDate() + 5);
    return next;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const next = new Date();
    next.setDate(next.getDate() + 5);
    return next;
  }

  return date;
}

function canViewOrder(order, viewer) {
  if (!order || !viewer) {
    return false;
  }

  if (viewer.userId && String(order.userId || "") === viewer.userId) {
    return true;
  }

  if (viewer.email && String(order.email || "") === viewer.email) {
    return true;
  }

  if (viewer.phone && String(order.phone || "") === viewer.phone) {
    return true;
  }

  return false;
}

function parseViewerIdentity(query) {
  const userId = parseString(query?.userId);
  const email = parseString(query?.email).toLowerCase();
  const phone = normalizePhone(query?.phone);

  return {
    userId,
    email,
    phone,
    hasIdentity: Boolean(userId || email || phone)
  };
}

function parsePaymentDetails(payload) {
  const paymentMethod = normalizePaymentMethod(payload?.paymentMethod, "COD");
  const defaultStatus = paymentMethod === "ONLINE" ? "PAID" : "PENDING";
  const paymentStatus = normalizePaymentStatus(payload?.paymentStatus, defaultStatus);

  return { paymentMethod, paymentStatus };
}

async function createOrderWithRetry(payload) {
  let order = null;
  let createError = null;

  for (let attempts = 0; attempts < 4 && !order; attempts += 1) {
    try {
      const generatedOrderId = generateOrderId();

      order = await Order.create({
        ...payload,
        orderId: generatedOrderId,
        orderNumber: generatedOrderId,
        trackingId: generateTrackingId()
      });
    } catch (error) {
      createError = error;
      if (error?.code !== 11000) {
        throw error;
      }
    }
  }

  if (!order) {
    if (createError?.code === 11000) {
      throw new Error("Could not generate a unique order number. Please try again.");
    }

    throw createError || new Error("Unable to place order at this time.");
  }

  return order;
}

function findOrderByPublicId(orderIdentifier) {
  return Order.findOne({
    $or: [{ orderId: orderIdentifier }, { orderNumber: orderIdentifier }]
  });
}

router.post("/", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const customer = parseCustomer(payload.customer || payload);
    const items = parseItems(payload.items);
    const pricing = computePricing(items, parseNumber(payload.shippingAmount));
    const payment = parsePaymentDetails(payload);
    const userId = parseString(payload.userId || payload.customer?.userId);
    const notes = parseString(payload.notes);
    const expectedDeliveryAt = parseExpectedDeliveryAt(payload.expectedDeliveryAt);

    const order = await createOrderWithRetry({
      userId,
      customerName: customer.customerName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      items,
      subtotal: pricing.subtotal,
      shippingAmount: pricing.shippingAmount,
      totalAmount: pricing.total,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      orderStatus: "placed",
      notes,
      expectedDeliveryAt,
      statusTimeline: [createStatusTimelineEntry("placed")]
    });

    return res.status(201).json({
      order,
      tracking: {
        status: order.orderStatus,
        statusLabel: statusLabel(order.orderStatus),
        delayed: isDelayedOrder(order),
        aiSuggestion: getDelayedSuggestion(order)
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return next(error);
  }
});

router.get("/my", async (req, res, next) => {
  try {
    const viewer = parseViewerIdentity(req.query || {});

    if (!viewer.hasIdentity) {
      return res.status(400).json({ message: "Provide userId, email, or phone to fetch your orders." });
    }

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const skip = (page - 1) * limit;

    const orderStatus = normalizeOrderStatus(req.query.status, "");

    const query = {
      $or: [
        viewer.userId ? { userId: viewer.userId } : null,
        viewer.email ? { email: viewer.email } : null,
        viewer.phone ? { phone: viewer.phone } : null
      ].filter(Boolean)
    };

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

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

router.get("/:orderId/invoice", async (req, res, next) => {
  try {
    const orderId = parseString(req.params.orderId);
    const viewer = parseViewerIdentity(req.query || {});

    if (!viewer.hasIdentity) {
      return res.status(400).json({ message: "Provide identity to download invoice." });
    }

    const order = await findOrderByPublicId(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!canViewOrder(order, viewer)) {
      return res.status(403).json({ message: "You are not allowed to access this order." });
    }

    const pdfBuffer = await generateInvoicePdf(order);
    const invoiceOrderId = order.orderId || order.orderNumber || "order";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceOrderId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const orderId = parseString(req.params.orderId);
    const viewer = parseViewerIdentity(req.query || {});

    if (!viewer.hasIdentity) {
      return res.status(400).json({ message: "Provide userId, email, or phone to view this order." });
    }

    const order = await findOrderByPublicId(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!canViewOrder(order, viewer)) {
      return res.status(403).json({ message: "You are not allowed to access this order." });
    }

    return res.json({
      order,
      tracking: {
        trackingId: order.trackingId,
        orderStatus: order.orderStatus,
        statusLabel: statusLabel(order.orderStatus),
        timeline: Array.isArray(order.statusTimeline) ? order.statusTimeline : [],
        delayed: isDelayedOrder(order),
        aiSuggestion: getDelayedSuggestion(order)
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
