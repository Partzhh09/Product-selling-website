import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyInvoiceUrl, getMyOrders } from "@/lib/api";
import { clearStoredUserSession, getStoredUserSession } from "@/lib/session";

const statusFilters = [
  { label: "All", value: "" },
  { label: "Placed", value: "placed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];

const statusBadgeStyles = {
  placed: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
  packed: "border-violet-200 bg-violet-50 text-violet-800",
  shipped: "border-blue-200 bg-blue-50 text-blue-800",
  out_for_delivery: "border-indigo-200 bg-indigo-50 text-indigo-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-red-200 bg-red-50 text-red-700"
};

function toLabel(status) {
  return String(status || "placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

function buildIdentity(session) {
  return {
    userId: String(session?.user?.id || ""),
    email: String(session?.user?.email || "").toLowerCase(),
    phone: String(session?.user?.phone || "")
  };
}

export function UserOrders() {
  const [session, setSession] = useState(() => getStoredUserSession());
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("hofo_user_orders_dark_mode") === "true";
  });

  const identity = useMemo(() => buildIdentity(session), [session]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("hofo_user_orders_dark_mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const currentSession = getStoredUserSession();
    setSession(currentSession);
  }, []);

  const loadOrders = async ({ targetPage = page, withLoader = true } = {}) => {
    if (!identity.userId && !identity.email && !identity.phone) {
      return;
    }

    if (withLoader) {
      setLoading(true);
    }
    setErrorMessage("");

    try {
      const result = await getMyOrders({
        page: targetPage,
        limit: 8,
        status: statusFilter,
        ...identity
      });

      let nextItems = result.items || [];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        nextItems = nextItems.filter((item) => String(item.orderId || "").toLowerCase().includes(q));
      }

      setOrders(nextItems);
      setPagination(result.pagination || null);
      setPage(result.pagination?.page || targetPage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load your orders.");
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    loadOrders();
  }, [session, statusFilter, page, searchQuery]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      loadOrders({ withLoader: false });
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [session, statusFilter, page, searchQuery, identity.userId, identity.email, identity.phone]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleLogout = () => {
    clearStoredUserSession();
    setSession(null);
    setOrders([]);
  };

  if (!session) {
    return (
      <div className="pb-24 pt-8">
        <section className="section-shell">
          <div className="mx-auto max-w-2xl grain-card rounded-[30px] p-6 text-center md:p-8 lg:p-10">
            <p className="hofo-eyebrow">Member Access</p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-5xl">
              Sign in to view your orders
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-hofo-walnut/72">
              Login is required to access your order history and tracking timeline.
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
    <div className={cn("pb-24 pt-8", darkMode && "bg-[#0f1720] text-slate-100")}>
      <section className="section-shell">
        <div className={cn(
          "rounded-[30px] p-6 md:p-8 lg:p-10",
          darkMode
            ? "border border-white/10 bg-white/5"
            : "grain-card"
        )}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.28em]", darkMode ? "text-teal-300" : "text-hofo-teak")}>User Panel</p>
              <h1 className={cn("mt-2 font-serif text-4xl leading-none md:text-6xl", darkMode ? "text-white" : "text-hofo-walnut-dark")}>My Orders</h1>
              <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed md:text-base", darkMode ? "text-slate-300" : "text-hofo-walnut/72")}>
                Track every order, view current status, and download invoices anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.12em]",
                  darkMode
                    ? "border border-white/20 bg-white/10 text-white"
                    : "border border-hofo-walnut/15 bg-white/80 text-hofo-walnut-dark"
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6">
        <div className={cn(
          "rounded-3xl p-4 md:p-5",
          darkMode ? "border border-white/10 bg-white/5" : "border border-hofo-walnut/10 bg-white/82"
        )}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
              <label className="relative block flex-1">
                <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", darkMode ? "text-slate-300" : "text-hofo-walnut/45")} />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by Order ID"
                  className={cn(
                    "h-10 w-full rounded-xl pl-9 pr-3 text-sm focus:outline-none",
                    darkMode
                      ? "border border-white/20 bg-slate-900/55 text-white placeholder:text-slate-400"
                      : "border border-hofo-walnut/15 bg-white text-hofo-walnut-dark placeholder:text-hofo-walnut/35"
                  )}
                />
              </label>
              <button
                type="submit"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.12em]",
                  darkMode ? "bg-teal-500 text-slate-950" : "bg-hofo-walnut-dark text-hofo-cream"
                )}
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatusFilter(filter.value);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    statusFilter === filter.value
                      ? darkMode
                        ? "bg-teal-500 text-slate-950"
                        : "bg-hofo-walnut-dark text-hofo-cream"
                      : darkMode
                        ? "border border-white/20 bg-white/5 text-slate-200"
                        : "border border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6 space-y-4">
        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
        )}

        {loading ? (
          <div className={cn(
            "rounded-3xl p-8 text-center text-sm",
            darkMode ? "border border-white/10 bg-white/5 text-slate-300" : "border border-hofo-walnut/10 bg-white/80 text-hofo-walnut/70"
          )}>
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className={cn(
            "rounded-3xl p-8 text-center text-sm",
            darkMode ? "border border-white/10 bg-white/5 text-slate-300" : "border border-hofo-walnut/10 bg-white/80 text-hofo-walnut/70"
          )}>
            No orders found.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.id || order.orderId}
                className={cn(
                  "rounded-3xl p-5 md:p-6",
                  darkMode
                    ? "border border-white/10 bg-white/5"
                    : "border border-hofo-walnut/10 bg-white/82 shadow-[0_14px_28px_rgba(28,16,8,0.08)]"
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", darkMode ? "text-slate-300" : "text-hofo-walnut/58")}>{formatDateTime(order.createdAt)}</p>
                    <h3 className={cn("mt-1 font-serif text-3xl leading-none", darkMode ? "text-white" : "text-hofo-walnut-dark")}>{order.orderId}</h3>
                    <p className={cn("mt-2 text-sm", darkMode ? "text-slate-300" : "text-hofo-walnut/72")}>{(order.items || []).length} item(s) | {order.paymentMethod} | {order.paymentStatus}</p>
                    <p className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-hofo-walnut/72")}>Tracking: {order.trackingId || "-"}</p>
                  </div>

                  <div className="space-y-2 text-left lg:text-right">
                    <span className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                      statusBadgeStyles[order.orderStatus] || "border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                    )}>
                      {toLabel(order.orderStatus)}
                    </span>
                    <p className={cn("text-base font-semibold", darkMode ? "text-white" : "text-hofo-walnut-dark")}>Rs.{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/my-orders/${encodeURIComponent(order.orderId)}`}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.13em]",
                      darkMode ? "bg-teal-500 text-slate-950" : "bg-hofo-walnut-dark text-hofo-cream"
                    )}
                  >
                    View Details
                  </Link>

                  <a
                    href={getMyInvoiceUrl(order.orderId, identity)}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.13em]",
                      darkMode
                        ? "border border-white/20 bg-white/5 text-slate-100"
                        : "border border-hofo-walnut/16 bg-white text-hofo-walnut-dark"
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Invoice
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:opacity-60",
                darkMode
                  ? "border border-white/20 bg-white/5 text-slate-100"
                  : "border border-hofo-walnut/16 bg-white text-hofo-walnut-dark"
              )}
            >
              Previous
            </button>

            <span className={cn("text-xs font-semibold uppercase tracking-[0.14em]", darkMode ? "text-slate-300" : "text-hofo-walnut/60")}>
              Page {page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:opacity-60",
                darkMode
                  ? "border border-white/20 bg-white/5 text-slate-100"
                  : "border border-hofo-walnut/16 bg-white text-hofo-walnut-dark"
              )}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
