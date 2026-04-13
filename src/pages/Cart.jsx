import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  clearCart,
  readCart,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";

export function Cart() {
  const [items, setItems] = useState([]);

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
          <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
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

              <button
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-hofo-walnut-dark text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak"
                type="button"
              >
                Proceed to Checkout
              </button>

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
