import mongoose from "mongoose";
import {
  getDelayedSuggestion,
  isDelayedOrder,
  ORDER_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
  statusLabel
} from "../utils/orderWorkflow.js";

function composeAddressText(address) {
  return [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postalCode
  ]
    .filter(Boolean)
    .join(", ");
}

const orderAddressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    quantity: { type: Number, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "", trim: true },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderStatusTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const notificationLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS_VALUES, required: true },
    channel: { type: String, required: true, trim: true },
    sent: { type: Boolean, default: false },
    details: { type: String, default: "", trim: true },
    sentAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, trim: true, unique: true },
    orderNumber: { type: String, required: true, trim: true, unique: true },
    userId: { type: String, default: "", trim: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: orderAddressSchema, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    shippingAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHOD_VALUES, default: "COD" },
    paymentStatus: { type: String, enum: PAYMENT_STATUS_VALUES, default: "PENDING" },
    orderStatus: { type: String, enum: ORDER_STATUS_VALUES, default: "placed" },
    trackingId: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    expectedDeliveryAt: { type: Date, default: null },
    statusTimeline: { type: [orderStatusTimelineSchema], default: [] },
    notificationLog: { type: [notificationLogSchema], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

orderSchema.pre("validate", function syncOrderIdentifiers(next) {
  if (!this.orderId && this.orderNumber) {
    this.orderId = this.orderNumber;
  }

  if (!this.orderNumber && this.orderId) {
    this.orderNumber = this.orderId;
  }

  next();
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    const addressText = composeAddressText(ret.address || {});
    const delayed = isDelayedOrder(ret);
    const canonicalOrderId = String(ret.orderId || ret.orderNumber || "");

    ret.orderId = canonicalOrderId;
    ret.orderNumber = canonicalOrderId;
    ret.customer = {
      name: ret.customerName,
      email: ret.email,
      phone: ret.phone,
      addressLine1: ret.address?.line1 || "",
      addressLine2: ret.address?.line2 || "",
      city: ret.address?.city || "",
      state: ret.address?.state || "",
      postalCode: ret.address?.postalCode || "",
      addressText
    };

    ret.pricing = {
      subtotal: Number(ret.subtotal || 0),
      shipping: Number(ret.shippingAmount || 0),
      total: Number(ret.totalAmount || 0)
    };

    ret.items = Array.isArray(ret.items)
      ? ret.items.map((item) => ({
          ...item,
          qty: Number(item?.qty || item?.quantity || 1),
          quantity: Number(item?.qty || item?.quantity || 1),
          lineTotal: Number(item?.lineTotal || Number(item?.price || 0) * Number(item?.qty || item?.quantity || 1))
        }))
      : [];

    ret.status = ret.orderStatus;
    ret.statusLabel = statusLabel(ret.orderStatus);
    ret.addressText = addressText;
    ret.delayed = delayed;
    ret.aiSuggestion = delayed ? getDelayedSuggestion(ret) : "";

    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
