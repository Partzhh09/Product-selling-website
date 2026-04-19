import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Download, Loader2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyInvoiceUrl, getMyOrderById } from "@/lib/api";
import { getStoredUserSession } from "@/lib/session";

const trackingSteps = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" }
];

function buildIdentity(session) {
  return {
    userId: String(session?.user?.id || ""),
    email: String(session?.user?.email || "").toLowerCase(),
    phone: String(session?.user?.phone || "")
  };
}

function formatDateTime(value) {
  const date = new Date(value || 0);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statusLabel(status) {
  return String(status || "placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusIndex(status) {
  return trackingSteps.findIndex((step) => step.key === status);
}

function getAddress(order) {
  if (!order) {
    return "";
  }

  if (order.addressText) {
    return order.addressText;
  }

  const customer = order.customer || {};

  return [
    customer?.addressLine1,
    customer?.addressLine2,
    customer?.city,
    customer?.state,
    customer?.postalCode
  ]
    .filter(Boolean)
    .join(", ");
}

export function OrderDetails() {
  const { orderId } = useParams();

  const [session, setSession] = useState(() => getStoredUserSession());
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const identity = useMemo(() => buildIdentity(session), [session]);

  useEffect(() => {
    const currentSession = getStoredUserSession();
    setSession(currentSession);
  }, []);

  useEffect(() => {
    if (!orderId || (!identity.userId && !identity.email && !identity.phone)) {
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const result = await getMyOrderById(orderId, identity);

        if (!cancelled) {
          setOrder(result.order);
          setTracking(result.tracking);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load order details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, identity.userId, identity.email, identity.phone]);

  if (!session) {
    return (
      <div className="pb-24 pt-8">
        <section className="section-shell">
          <div className="mx-auto max-w-2xl grain-card rounded-[30px] p-6 text-center md:p-8 lg:p-10">
            <p className="hofo-eyebrow">Authentication Required</p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-5xl">
              Sign in to track this order
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-hofo-walnut/72">
              Login is required before you can view order details.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak"
            >
              Go to Login
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="hofo-eyebrow">Order Details</p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">
                Track Your Shipment
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                View progress updates, delivery details, invoice, and order summary.
              </p>
            </div>

            <Link
              to="/my-orders"
              className="inline-flex h-10 items-center justify-center rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell mt-8">
        {loading ? (
          <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            Loading order details...
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{errorMessage}</div>
        ) : !order ? (
          <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
            Order not found.
          </div>
        ) : (
          <div className="space-y-5">
            <article className="rounded-3xl border border-hofo-walnut/10 bg-white/85 p-5 shadow-[0_14px_28px_rgba(28,16,8,0.08)] md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/58">{formatDateTime(order.createdAt)}</p>
                  <h2 className="mt-1 font-serif text-3xl leading-none text-hofo-walnut-dark">{order.orderId}</h2>
                  <p className="mt-2 text-sm text-hofo-walnut/72">Tracking ID: {order.trackingId || "-"}</p>
                  <p className="text-sm text-hofo-walnut/72">Payment: {order.paymentMethod} | {order.paymentStatus}</p>
                </div>

                <div className="text-left md:text-right">
                  <span className="inline-flex rounded-full border border-hofo-walnut/15 bg-hofo-beige/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark">
                    {statusLabel(order.orderStatus)}
                  </span>
                  <p className="mt-2 text-base font-semibold text-hofo-walnut-dark">Total: Rs.{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                  <a
                    href={getMyInvoiceUrl(order.orderId, identity)}
                    className="mt-2 inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Invoice
                  </a>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-hofo-walnut/10 bg-white/85 p-5 shadow-[0_14px_28px_rgba(28,16,8,0.08)] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Live Tracking</p>

              {order.orderStatus === "cancelled" ? (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  This order has been cancelled.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto pb-1">
                  <div className="flex min-w-[700px] items-start gap-0">
                    {trackingSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(order.orderStatus);
                      const isCompleted = currentIndex >= index;
                      const isCurrent = currentIndex === index;

                      return (
                        <div key={step.key} className="flex flex-1 items-start">
                          <div className="flex flex-col items-center text-center">
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                                isCompleted
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                  : "border-hofo-walnut/20 bg-white text-hofo-walnut/55"
                              )}
                            >
                              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                            </span>
                            <p className={cn("mt-2 text-xs font-semibold uppercase tracking-[0.12em]", isCurrent ? "text-hofo-walnut-dark" : "text-hofo-walnut/58")}>
                              {step.label}
                            </p>
                          </div>

                          {index < trackingSteps.length - 1 && (
                            <div className={cn(
                              "mt-4 h-0.5 flex-1",
                              currentIndex > index ? "bg-emerald-300" : "bg-hofo-walnut/18"
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {order.aiSuggestion && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <Truck className="mr-1 inline h-4 w-4" />
                  {order.aiSuggestion}
                </p>
              )}
            </article>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <article className="rounded-3xl border border-hofo-walnut/10 bg-white/85 p-5 shadow-[0_14px_28px_rgba(28,16,8,0.08)] md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Items</p>

                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-hofo-walnut/10 bg-white p-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=1200&auto=format&fit=crop"}
                        alt={item.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-hofo-walnut-dark">{item.name}</p>
                        <p className="text-xs text-hofo-walnut/65">Qty: {Number(item.qty || item.quantity || 0)}</p>
                      </div>
                      <p className="text-sm font-semibold text-hofo-walnut-dark">Rs.{Number(item.lineTotal || 0).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-hofo-walnut/10 bg-white/85 p-5 shadow-[0_14px_28px_rgba(28,16,8,0.08)] md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Delivery</p>
                <p className="mt-3 text-sm text-hofo-walnut/72">{getAddress(order)}</p>

                <div className="soft-divider my-4" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Pricing</p>
                <div className="mt-3 space-y-2 text-sm text-hofo-walnut/72">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>Rs.{Number(order.subtotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>Rs.{Number(order.shippingAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="soft-divider my-2" />
                  <div className="flex items-center justify-between text-base font-semibold text-hofo-walnut-dark">
                    <span>Total</span>
                    <span>Rs.{Number(order.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
