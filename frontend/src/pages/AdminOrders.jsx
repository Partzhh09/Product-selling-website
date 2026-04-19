import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Loader2,
  LogOut,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  Shield,
  X,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminLogin,
  clearStoredAdminToken,
  getAdminInvoiceUrl,
  getAdminOrderFeed,
  getStoredAdminToken,
  setStoredAdminToken,
  updateAdminOrder,
  updateAdminOrderStatus
} from "@/lib/api";

const statusFilters = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
];

const primaryActionByStatus = {
  placed: { label: "Accept Order", action: "accept" },
  confirmed: { label: "Mark as Packed", action: "packed" },
  packed: { label: "Mark as Shipped", action: "shipped" },
  shipped: { label: "Out for Delivery", action: "out_for_delivery" },
  out_for_delivery: { label: "Delivered", action: "delivered" }
};

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

function getOrderAddress(order) {
  if (order?.addressText) {
    return order.addressText;
  }

  const customer = order?.customer || {};

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

export function AdminOrders() {
  const [adminSecret, setAdminSecret] = useState("");
  const [token, setToken] = useState("");

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState({
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    trackingId: "",
    notes: ""
  });

  const dashboardStats = useMemo(() => {
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    const pendingOrders = orders.filter((order) =>
      ["placed", "confirmed", "packed", "shipped", "out_for_delivery"].includes(order?.orderStatus)
    ).length;
    const deliveredOrders = orders.filter((order) => order?.orderStatus === "delivered").length;
    const cancelledOrders = orders.filter((order) => order?.orderStatus === "cancelled").length;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders
    };
  }, [orders]);

  useEffect(() => {
    const savedToken = getStoredAdminToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const loadOrders = async ({ withLoader = true, targetPage = page } = {}) => {
    if (!token) {
      return;
    }

    if (withLoader) {
      setLoadingOrders(true);
    }

    setErrorMessage("");

    try {
      const result = await getAdminOrderFeed(token, {
        page: targetPage,
        limit: 10,
        status: statusFilter,
        q: searchQuery
      });

      setOrders(result.items || []);
      setPagination(result.pagination || null);
      setPage(result.pagination?.page || targetPage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load orders.");
    } finally {
      if (withLoader) {
        setLoadingOrders(false);
      }
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadOrders();
  }, [token, statusFilter, page, searchQuery]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!adminSecret.trim()) {
      setErrorMessage("Enter your admin password to continue.");
      return;
    }

    try {
      const nextToken = await adminLogin(adminSecret.trim());
      setStoredAdminToken(nextToken);
      setToken(nextToken);
      setAdminSecret("");
      setStatusMessage("Admin session started.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Admin login failed.");
    }
  };

  const handleLogout = () => {
    clearStoredAdminToken();
    setToken("");
    setOrders([]);
    setPagination(null);
    setEditingId("");
    setStatusMessage("Admin session ended.");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const openEdit = (order) => {
    setEditingId(order.id || order.orderId);
    setEditDraft({
      paymentMethod: String(order.paymentMethod || "COD"),
      paymentStatus: String(order.paymentStatus || "PENDING"),
      trackingId: String(order.trackingId || ""),
      notes: String(order.notes || "")
    });
  };

  const closeEdit = () => {
    setEditingId("");
    setEditDraft({
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      trackingId: "",
      notes: ""
    });
  };

  const handleSaveEdit = async (order) => {
    const identifier = order.id || order.orderId;
    setActionLoadingId(identifier);
    setErrorMessage("");

    try {
      const updated = await updateAdminOrder(identifier, editDraft, token);

      setOrders((current) =>
        current.map((item) => (item.id === updated.id || item.orderId === updated.orderId ? updated : item))
      );

      setStatusMessage(`Order ${updated.orderId} updated.`);
      closeEdit();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleOrderStatusAction = async (order, action) => {
    const identifier = order.id || order.orderId;
    setActionLoadingId(identifier);
    setErrorMessage("");

    try {
      const updated = await updateAdminOrderStatus(identifier, { action }, token);

      setOrders((current) =>
        current.map((item) => (item.id === updated.id || item.orderId === updated.orderId ? updated : item))
      );

      setStatusMessage(`Order ${updated.orderId} moved to ${toLabel(updated.orderStatus)}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update order status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleInvoiceDownload = async (order) => {
    const identifier = order.id || order.orderId;
    setActionLoadingId(identifier);
    setErrorMessage("");

    try {
      const response = await fetch(getAdminInvoiceUrl(identifier), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to download invoice.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to download invoice.");
    } finally {
      setActionLoadingId("");
    }
  };

  if (!token) {
    return (
      <div className="pb-24 pt-8">
        <section className="section-shell">
          <div className="mx-auto max-w-xl grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
            <p className="hofo-eyebrow">Admin Access</p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-5xl">
              Sign in to Order Desk
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-hofo-walnut/72">
              Use your configured admin password to manage order flow.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Admin Password
                </span>
                <input
                  value={adminSecret}
                  onChange={(event) => setAdminSecret(event.target.value)}
                  placeholder="Enter admin password"
                  className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                />
              </label>

              {errorMessage && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak"
              >
                Open Order Panel
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-teak">
                Order Management
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">
                Admin Fulfillment Desk
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Manage live orders, update status flow, notify customers, and download invoices.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadOrders()}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{
          label: "Visible Orders",
          value: dashboardStats.totalOrders
        }, {
          label: "Pending Flow",
          value: dashboardStats.pendingOrders
        }, {
          label: "Delivered",
          value: dashboardStats.deliveredOrders
        }, {
          label: "Cancelled",
          value: dashboardStats.cancelledOrders
        }].map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">{card.label}</p>
            <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="section-shell mt-6">
        <div className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-4 shadow-[0_12px_30px_rgba(30,18,10,0.07)] md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by Order ID, phone, or customer"
                  className="h-10 w-full rounded-xl border border-hofo-walnut/15 bg-white pl-9 pr-3 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-full bg-hofo-walnut-dark px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-cream hover:bg-hofo-teak"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatusFilter(filter.value);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    statusFilter === filter.value
                      ? "bg-hofo-walnut-dark text-hofo-cream"
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
        {statusMessage && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {loadingOrders ? (
          <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
            No orders found for the current filters.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const orderKey = order.id || order.orderId;
              const isSaving = actionLoadingId === orderKey;
              const currentStatus = String(order.orderStatus || "placed");
              const primaryAction = primaryActionByStatus[currentStatus] || null;
              const canCancel = !["cancelled", "delivered"].includes(currentStatus);
              const itemSummary = (Array.isArray(order.items) ? order.items : [])
                .map((item) => `${item.name} x${Number(item.qty || item.quantity || 0)}`)
                .join(", ");

              return (
                <article
                  key={orderKey}
                  className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_14px_28px_rgba(28,16,8,0.08)] md:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/58">{formatDateTime(order.createdAt)}</p>
                      <h3 className="font-serif text-3xl leading-none text-hofo-walnut-dark">{order.orderId}</h3>
                      <p className="text-sm text-hofo-walnut/72">{order.customerName} | {order.phone}</p>
                      <p className="text-sm text-hofo-walnut/68">{order.email}</p>
                      <p className="text-sm text-hofo-walnut/68">{getOrderAddress(order)}</p>
                      <p className="text-sm text-hofo-walnut/72">{itemSummary}</p>
                    </div>

                    <div className="space-y-2 text-left lg:text-right">
                      <span className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                        statusBadgeStyles[currentStatus] || "border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                      )}>
                        {toLabel(currentStatus)}
                      </span>

                      <p className="text-sm text-hofo-walnut/72">Payment: {order.paymentMethod} | {order.paymentStatus}</p>
                      <p className="text-sm text-hofo-walnut/72">Tracking: {order.trackingId || "-"}</p>
                      <p className="text-base font-semibold text-hofo-walnut-dark">Total: Rs.{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {order.aiSuggestion && (
                    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      {order.aiSuggestion}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {primaryAction && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleOrderStatusAction(order, primaryAction.action)}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-hofo-walnut-dark px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-65"
                      >
                        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {primaryAction.label}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleOrderStatusAction(order, "cancel")}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-65"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Order
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleInvoiceDownload(order)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Invoice
                    </button>

                    {editingId === orderKey ? (
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark"
                      >
                        <X className="h-3.5 w-3.5" />
                        Close Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit(order)}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingId === orderKey && (
                    <div className="mt-4 grid gap-3 rounded-2xl border border-hofo-walnut/12 bg-hofo-beige/30 p-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">Payment Method</span>
                        <select
                          value={editDraft.paymentMethod}
                          onChange={(event) => setEditDraft((current) => ({ ...current, paymentMethod: event.target.value }))}
                          className="h-10 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:outline-none"
                        >
                          <option value="COD">COD</option>
                          <option value="ONLINE">ONLINE</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">Payment Status</span>
                        <select
                          value={editDraft.paymentStatus}
                          onChange={(event) => setEditDraft((current) => ({ ...current, paymentStatus: event.target.value }))}
                          className="h-10 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="FAILED">FAILED</option>
                          <option value="REFUNDED">REFUNDED</option>
                        </select>
                      </label>

                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">Tracking ID</span>
                        <input
                          value={editDraft.trackingId}
                          onChange={(event) => setEditDraft((current) => ({ ...current, trackingId: event.target.value }))}
                          className="h-10 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:outline-none"
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">Notes</span>
                        <textarea
                          rows={3}
                          value={editDraft.notes}
                          onChange={(event) => setEditDraft((current) => ({ ...current, notes: event.target.value }))}
                          className="w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-sm text-hofo-walnut-dark focus:outline-none"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveEdit(order)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-65 md:col-span-2"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Order Changes
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={page <= 1 || loadingOrders}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex h-10 items-center rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut/60">
              Page {page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages || loadingOrders}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex h-10 items-center rounded-full border border-hofo-walnut/16 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="section-shell mt-8">
        <div className="grain-card rounded-3xl p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Workflow</p>
          <p className="mt-2 text-sm text-hofo-walnut/72">
            {"Placed -> Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered"}
          </p>
          <p className="mt-2 text-sm text-hofo-walnut/68">
            Email and WhatsApp notifications trigger on status updates when credentials are configured.
          </p>
          <p className="mt-2 text-sm text-hofo-walnut/68">
            Open Product Admin at /admin/products.
          </p>
        </div>
      </section>
    </div>
  );
}
