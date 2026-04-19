export const ORDER_STATUS_FLOW = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered"
];

export const ORDER_STATUS_VALUES = [...ORDER_STATUS_FLOW, "cancelled"];

export const PAYMENT_METHOD_VALUES = ["COD", "ONLINE"];
export const PAYMENT_STATUS_VALUES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

const STATUS_ALIASES = {
  outfordelivery: "out_for_delivery",
  out_for_delivery: "out_for_delivery",
  "out-for-delivery": "out_for_delivery",
  placed: "placed",
  confirmed: "confirmed",
  packed: "packed",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled"
};

const ACTION_TO_STATUS = {
  accept: "confirmed",
  confirm: "confirmed",
  packed: "packed",
  mark_packed: "packed",
  ship: "shipped",
  shipped: "shipped",
  mark_shipped: "shipped",
  out_for_delivery: "out_for_delivery",
  outfordelivery: "out_for_delivery",
  delivered: "delivered",
  mark_delivered: "delivered",
  cancel: "cancelled",
  cancelled: "cancelled"
};

export function normalizeOrderStatus(value, fallback = "placed") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const status = STATUS_ALIASES[normalized] || normalized;
  return ORDER_STATUS_VALUES.includes(status) ? status : fallback;
}

export function normalizePaymentMethod(value, fallback = "COD") {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  return PAYMENT_METHOD_VALUES.includes(normalized) ? normalized : fallback;
}

export function normalizePaymentStatus(value, fallback = "PENDING") {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  return PAYMENT_STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

export function statusLabel(value) {
  const status = normalizeOrderStatus(value);

  return {
    placed: "Placed",
    confirmed: "Confirmed",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled"
  }[status];
}

export function nextStatuses(currentStatus) {
  const current = normalizeOrderStatus(currentStatus);

  if (TERMINAL_STATUSES.has(current)) {
    return [];
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
  const next = ORDER_STATUS_FLOW[currentIndex + 1];

  return next ? [next, "cancelled"] : ["cancelled"];
}

export function canTransition(currentStatus, nextStatus) {
  const current = normalizeOrderStatus(currentStatus);
  const next = normalizeOrderStatus(nextStatus, "");

  if (!next) {
    return false;
  }

  if (current === next) {
    return true;
  }

  if (TERMINAL_STATUSES.has(current)) {
    return false;
  }

  if (next === "cancelled") {
    return current !== "delivered";
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(next);

  return nextIndex === currentIndex + 1;
}

export function getStatusFromAction(action, fallback = "") {
  const normalizedAction = String(action || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return ACTION_TO_STATUS[normalizedAction] || fallback;
}

export function isDelayedOrder(order, now = new Date()) {
  const status = normalizeOrderStatus(order?.orderStatus || order?.status);

  if (status === "delivered" || status === "cancelled") {
    return false;
  }

  const expectedDate = new Date(order?.expectedDeliveryAt || 0);

  if (Number.isNaN(expectedDate.getTime())) {
    return false;
  }

  return now.getTime() > expectedDate.getTime();
}

export function getDelayedSuggestion(order) {
  if (!isDelayedOrder(order)) {
    return "";
  }

  return "This order might be delayed. Consider contacting the customer proactively.";
}

export function createStatusTimelineEntry(status) {
  return {
    status: normalizeOrderStatus(status),
    changedAt: new Date()
  };
}
