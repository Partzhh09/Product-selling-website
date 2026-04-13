import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, Search, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Custom Order", path: "/custom-order" },
  { name: "Factory", path: "/factory" },
  { name: "Journal", path: "/blog" },
  { name: "Admin", path: "/admin" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const openSearch = () => {
    const currentSearch = new URLSearchParams(location.search).get("search") ?? "";
    setSearchTerm(currentSearch);
    setSearchOpen(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [searchOpen]);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount());
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== "hofo_cart_v1") {
        return;
      }

      syncCartCount();
    };

    syncCartCount();
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <>
      <div className="relative z-[70] border-b border-hofo-walnut-dark/30 bg-gradient-to-r from-hofo-walnut-dark via-hofo-walnut to-hofo-walnut-dark text-[11px] uppercase tracking-[0.2em] text-hofo-accent">
        <div className="section-shell flex min-h-10 items-center justify-center gap-3 py-2 text-center font-semibold sm:gap-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Festival Craft Week: Flat 15% Off</span>
          <span className="hidden sm:inline">Use Code WOOD15</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "border-b border-hofo-walnut/10 bg-hofo-cream/90 py-3 shadow-[0_10px_35px_rgba(30,16,8,0.12)] backdrop-blur-xl"
            : "bg-transparent py-4"
        )}
      >
        <div className="section-shell flex items-center justify-between gap-6">
          <Link to="/" className="z-50 flex items-end gap-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-hofo-walnut-dark sm:text-4xl">HOFO</span>
            <span className="hidden pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-hofo-walnut/60 sm:block">
              Atelier
            </span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-hofo-walnut/10 bg-white/65 p-1.5 shadow-[0_12px_30px_rgba(51,26,13,0.08)] backdrop-blur-md md:flex xl:mx-4 xl:flex-1 xl:gap-1">
            {navLinks.map((link, index) => {
              const active = isActive(link.path);

              return (
                <motion.div
                  key={link.name}
                  className="xl:flex-1"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      "relative block overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors xl:w-full xl:px-2 xl:text-center",
                      active
                        ? "text-hofo-cream"
                        : "text-hofo-walnut/70 hover:bg-hofo-beige/55 hover:text-hofo-walnut-dark"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-active-link"
                        className="absolute inset-0 rounded-full bg-hofo-walnut-dark"
                        transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.72 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hofo-walnut/15 bg-white/65 text-hofo-walnut-dark shadow-sm hover:-translate-y-0.5 hover:border-hofo-teak/40 hover:text-hofo-teak"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-hofo-walnut/15 bg-white/65 text-hofo-walnut-dark shadow-sm hover:-translate-y-0.5 hover:border-hofo-teak/40 hover:text-hofo-teak"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-hofo-teak text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>

            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/75 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark hover:-translate-y-0.5 hover:border-hofo-teak/40 hover:text-hofo-teak"
            >
              <User className="h-3.5 w-3.5" />
              Login
            </Link>

            <Link
              to="/custom-order"
              className="inline-flex items-center gap-2 rounded-full bg-hofo-forest px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:-translate-y-0.5 hover:bg-hofo-walnut-dark"
            >
              Get Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            className="z-50 flex h-11 w-11 items-center justify-center rounded-full border border-hofo-walnut/15 bg-white/75 text-hofo-walnut-dark shadow-sm md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-hofo-walnut-dark/55 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm border-l border-hofo-walnut/15 bg-hofo-cream p-6 shadow-[0_22px_50px_rgba(20,10,6,0.32)] md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="hofo-eyebrow">Navigation</p>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-hofo-walnut/15 text-hofo-walnut"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link, index) => {
                  const active = isActive(link.path);

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 + index * 0.05, duration: 0.25, ease: "easeOut" }}
                    >
                      <Link
                        to={link.path}
                        className={cn(
                          "relative block overflow-hidden rounded-2xl px-5 py-4 text-lg font-medium",
                          active
                            ? "text-hofo-cream"
                            : "text-hofo-walnut-dark hover:bg-hofo-beige/50"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="mobile-active-link"
                            className="absolute inset-0 rounded-2xl bg-hofo-walnut-dark"
                            transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.85 }}
                          />
                        )}
                        <span className="relative z-10">{link.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="soft-divider my-8" />

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSearch();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-hofo-walnut/20 bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark"
                  type="button"
                >
                  <Search className="h-4 w-4" />
                  Search Catalog
                </button>
                <Link
                  to="/cart"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-hofo-walnut/20 bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View Cart ({cartCount})
                </Link>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-hofo-walnut/20 bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark"
                >
                  <User className="h-4 w-4" />
                  Login / Sign Up
                </Link>
                <Link
                  to="/custom-order"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-hofo-forest px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-hofo-cream"
                >
                  Start Custom Order
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-[88] bg-hofo-walnut-dark/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="fixed left-1/2 top-[16%] z-[89] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 rounded-3xl border border-hofo-walnut/15 bg-hofo-cream/95 p-5 shadow-[0_28px_60px_rgba(18,10,6,0.35)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut-dark">Search Catalog</p>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hofo-walnut/18 text-hofo-walnut-dark"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-2xl border border-hofo-walnut/12 bg-white/80 p-2.5">
                <Search className="ml-1 h-4 w-4 text-hofo-walnut/55" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  autoFocus
                  placeholder="Search by product, wood type, or category"
                  className="h-10 flex-1 bg-transparent px-2 text-sm text-hofo-walnut-dark outline-none placeholder:text-hofo-walnut/45"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-hofo-walnut-dark px-4 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak"
                >
                  Search
                </button>
              </form>

              <p className="mt-3 text-xs text-hofo-walnut/65">Try: teak board, serving tray, gift set</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
