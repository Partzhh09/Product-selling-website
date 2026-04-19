import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound
} from "lucide-react";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  clearCart,
  readCart,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";
import { placeOrder } from "@/lib/api";
import { getStoredUserSession } from "@/lib/session";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10,15}$/;
const postalCodeRegex = /^\d{4,10}$/;

const initialCheckoutDetails = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  notes: ""
};

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePostalCode(value) {
  return String(value || "").replace(/\s+/g, "");
}

export function Cart() {
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutDetails, setCheckoutDetails] = useState(initialCheckoutDetails);
  const [fieldErrors, setFieldErrors] = useState({});
  const [checkoutError, setCheckoutError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart());
    };

    syncCart();

    const handleStorage = (event) => {
      if (event.key && event.key !== CART_STORAGE_KEY) {
        return;
      }

      syncCart();
    };

    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const shipping = itemCount === 0 ? 0 : subtotal >= 5000 ? 0 : 299;
  const total = subtotal + shipping;

  const increase = (item) => {
    setItems(updateCartQuantity(item.id, item.quantity + 1));
  };

  const decrease = (item) => {
    if (item.quantity <= 1) {
      setItems(removeFromCart(item.id));
      return;
    }

    setItems(updateCartQuantity(item.id, item.quantity - 1));
  };

  const remove = (itemId) => {
    setItems(removeFromCart(itemId));
  };

  const clearAll = () => {
    setItems(clearCart());
  };

  const setCheckoutField = (field, value) => {
    setCheckoutDetails((current) => ({ ...current, [field]: value }));

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const { [field]: _removed, ...next } = current;
      return next;
    });

    setCheckoutError("");
  };

  const validateCheckoutDetails = () => {
    const nextErrors = {};

    const normalized = {
      name: checkoutDetails.name.trim(),
      email: checkoutDetails.email.trim().toLowerCase(),
      phone: normalizePhone(checkoutDetails.phone),
      addressLine1: checkoutDetails.addressLine1.trim(),
      addressLine2: checkoutDetails.addressLine2.trim(),
      city: checkoutDetails.city.trim(),
      state: checkoutDetails.state.trim(),
      postalCode: normalizePostalCode(checkoutDetails.postalCode),
      notes: checkoutDetails.notes.trim()
    };

    if (!normalized.name) {
      nextErrors.name = "Full name is required.";
    }

    if (!normalized.email || !emailRegex.test(normalized.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!phoneRegex.test(normalized.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!normalized.addressLine1) {
      nextErrors.addressLine1 = "Address is required.";
    }

    if (!normalized.city) {
      nextErrors.city = "City is required.";
    }

    if (!normalized.state) {
      nextErrors.state = "State is required.";
    }

    if (!postalCodeRegex.test(normalized.postalCode)) {
      nextErrors.postalCode = "Enter a valid postal code.";
    }

    return {
      normalized,
      nextErrors
    };
  };

  const getInputClass = (field) => {
    const hasError = Boolean(fieldErrors[field]);

    return [
      "h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:outline-none",
      hasError ? "border-red-300 focus:border-red-400" : "border-hofo-walnut/15 focus:border-hofo-teak"
    ].join(" ");
  };

  const getTextareaClass = (field) => {
    const hasError = Boolean(fieldErrors[field]);

    return [
      "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:outline-none",
      hasError ? "border-red-300 focus:border-red-400" : "border-hofo-walnut/15 focus:border-hofo-teak"
    ].join(" ");
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    const { normalized, nextErrors } = validateCheckoutDetails();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setCheckoutError("Please complete all required delivery details before checkout.");
      return;
    }

    setCheckoutError("");
    setFieldErrors({});
    setPlacingOrder(true);

    try {
      const session = getStoredUserSession();

      const order = await placeOrder({
        userId: String(session?.user?.id || ""),
        customerName: normalized.name,
        phone: normalized.phone,
        email: normalized.email,
        address: {
          line1: normalized.addressLine1,
          line2: normalized.addressLine2,
          city: normalized.city,
          state: normalized.state,
          postalCode: normalized.postalCode
        },
        paymentMethod,
        paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
        customer: {
          name: normalized.name,
          email: normalized.email,
          phone: normalized.phone,
          addressLine1: normalized.addressLine1,
          addressLine2: normalized.addressLine2,
          city: normalized.city,
          state: normalized.state,
          postalCode: normalized.postalCode
        },
        notes: normalized.notes,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        }))
      });

      setPlacedOrder(order);
      setCheckoutDetails(initialCheckoutDetails);
      setPaymentMethod("COD");
      clearAll();
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Could not place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="hofo-eyebrow">Checkout</p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">Your Cart</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Review your handcrafted selections, adjust quantities, and proceed when you are ready.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-hofo-walnut/18 bg-white/80 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark hover:bg-hofo-beige/55"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        {placedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_30px_rgba(16,97,62,0.14)] md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Order Confirmed</p>
                  <h2 className="mt-1 font-serif text-3xl leading-none text-hofo-walnut-dark md:text-4xl">
                    Your order is placed.
                  </h2>
                  <p className="mt-2 text-sm text-hofo-walnut/75">
                    Order ID: <span className="font-semibold text-hofo-walnut-dark">{placedOrder.orderNumber || "Generated"}</span>
                  </p>
                  <p className="mt-1 text-sm text-hofo-walnut/75">
                    We will contact {placedOrder?.customer?.name || "you"} shortly with shipping confirmation.
                  </p>
                </div>
              </div>

              <Link
                to="/products"
                className="inline-flex h-10 items-center justify-center rounded-full bg-hofo-walnut-dark px-5 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}

        {items.length === 0 ? (
          <div className="grain-card rounded-[30px] p-8 text-center md:p-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-hofo-walnut/35" />
            <h2 className="mt-5 font-serif text-4xl text-hofo-walnut-dark md:text-5xl">Your cart is empty</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-hofo-walnut/68 md:text-base">
              Start with our signature boards, bowls, and trays. Added items will appear here automatically.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.15em] text-hofo-cream hover:bg-hofo-teak"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1fr_430px]">
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="overflow-hidden rounded-3xl border border-hofo-walnut/10 bg-white/80 shadow-[0_15px_30px_rgba(28,16,8,0.08)]"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-full rounded-2xl object-cover sm:h-24 sm:w-24"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-serif text-2xl text-hofo-walnut-dark">{item.name}</h3>
                      <p className="mt-2 text-sm text-hofo-walnut/65">Rs.{item.price.toLocaleString("en-IN")} each</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.13em] text-hofo-walnut/52">
                        Line Total: Rs.{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="inline-flex items-center gap-1 rounded-full border border-hofo-walnut/14 bg-white p-1">
                        <button
                          onClick={() => decrease(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-hofo-walnut-dark hover:bg-hofo-beige/55"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold text-hofo-walnut-dark">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increase(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-hofo-walnut-dark hover:bg-hofo-beige/55"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58 hover:text-red-600"
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}

              <button
                onClick={clearAll}
                className="inline-flex h-10 items-center justify-center rounded-full border border-hofo-walnut/16 bg-white/85 px-5 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut-dark hover:bg-hofo-beige/50"
                type="button"
              >
                Clear Cart
              </button>
            </div>

            <aside className="h-max rounded-3xl border border-hofo-walnut/10 bg-white/82 p-6 shadow-[0_18px_35px_rgba(30,18,10,0.1)] xl:sticky xl:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Order Summary</p>

              <div className="mt-5 space-y-3 text-sm text-hofo-walnut-dark">
                <div className="flex items-center justify-between">
                  <span>Items ({itemCount})</span>
                  <span>Rs.{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `Rs.${shipping.toLocaleString("en-IN")}`}</span>
                </div>
                <div className="soft-divider my-2" />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>Rs.{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <form className="mt-6 space-y-3" onSubmit={handleCheckout}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/58">Delivery Details</p>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                    Full Name
                  </span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                    <input
                      value={checkoutDetails.name}
                      onChange={(event) => setCheckoutField("name", event.target.value)}
                      className={getInputClass("name")}
                      placeholder="Your full name"
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                      Email
                    </span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                      <input
                        value={checkoutDetails.email}
                        onChange={(event) => setCheckoutField("email", event.target.value)}
                        type="email"
                        className={getInputClass("email")}
                        placeholder="you@example.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                      Phone
                    </span>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                      <input
                        value={checkoutDetails.phone}
                        onChange={(event) => setCheckoutField("phone", event.target.value)}
                        className={getInputClass("phone")}
                        placeholder="9876543210"
                      />
                    </div>
                    {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                    Address Line 1
                  </span>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                    <input
                      value={checkoutDetails.addressLine1}
                      onChange={(event) => setCheckoutField("addressLine1", event.target.value)}
                      className={getInputClass("addressLine1")}
                      placeholder="House number, street, area"
                    />
                  </div>
                  {fieldErrors.addressLine1 && <p className="mt-1 text-xs text-red-600">{fieldErrors.addressLine1}</p>}
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                    Address Line 2 (Optional)
                  </span>
                  <input
                    value={checkoutDetails.addressLine2}
                    onChange={(event) => setCheckoutField("addressLine2", event.target.value)}
                    className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="Apartment, landmark"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block sm:col-span-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                      City
                    </span>
                    <input
                      value={checkoutDetails.city}
                      onChange={(event) => setCheckoutField("city", event.target.value)}
                      className={getTextareaClass("city")}
                      placeholder="City"
                    />
                    {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
                  </label>

                  <label className="block sm:col-span-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                      State
                    </span>
                    <input
                      value={checkoutDetails.state}
                      onChange={(event) => setCheckoutField("state", event.target.value)}
                      className={getTextareaClass("state")}
                      placeholder="State"
                    />
                    {fieldErrors.state && <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>}
                  </label>

                  <label className="block sm:col-span-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                      Postal Code
                    </span>
                    <input
                      value={checkoutDetails.postalCode}
                      onChange={(event) => setCheckoutField("postalCode", event.target.value)}
                      className={getTextareaClass("postalCode")}
                      placeholder="400001"
                    />
                    {fieldErrors.postalCode && <p className="mt-1 text-xs text-red-600">{fieldErrors.postalCode}</p>}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                    Payment Method
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="ONLINE">Online Payment</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/62">
                    Order Note (Optional)
                  </span>
                  <textarea
                    value={checkoutDetails.notes}
                    onChange={(event) => setCheckoutField("notes", event.target.value)}
                    className="w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2.5 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    rows={3}
                    placeholder="Any delivery notes or special requests"
                  />
                </label>

                {checkoutError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <CircleAlert className="mr-1 inline h-3.5 w-3.5" />
                    {checkoutError}
                  </p>
                )}

                <button
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={placingOrder}
                >
                  {placingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </form>

              <div className="mt-6 space-y-3 rounded-2xl border border-hofo-walnut/10 bg-hofo-beige/35 p-4 text-xs uppercase tracking-[0.14em] text-hofo-walnut/70">
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-hofo-teak" />
                  Fast Nationwide Delivery
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-hofo-teak" />
                  Secure Payment Options
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-hofo-teak" />
                  Hand-Checked Before Dispatch
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
