import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, Moon, Search, ShoppingBag, Sparkles, Sun, User, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";
import {
  clearStoredUserSession,
  getStoredUserSession,
  setStoredUserSession,
  USER_SESSION_STORAGE_KEY,
  USER_SESSION_TEMP_STORAGE_KEY,
  USER_SESSION_UPDATED_EVENT
} from "@/lib/session";
import { updateUserProfile } from "@/lib/api";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Collections", path: "/collections" },
  { name: "Factory", path: "/factory" },
  { name: "Journal", path: "/blog" },
];

function getUserDisplayName(session) {
  const fullName = String(session?.user?.fullName || "").trim();
  if (fullName) {
    return fullName;
  }

  const email = String(session?.user?.email || "").trim();
  if (email) {
    return email.split("@")[0] || "Member";
  }

  return "Member";
}

function getUserInitial(displayName) {
  const normalized = String(displayName || "").trim();
  if (!normalized) {
    return "M";
  }

  return normalized[0]?.toUpperCase() || "M";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10,15}$/;

export function Navbar({ theme = "light", onToggleTheme = () => {} }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userSession, setUserSession] = useState(() => getStoredUserSession());
  const location = useLocation();
  const isDark = theme === "dark";
  const profileButtonRef = useRef(null);
  const profilePanelRef = useRef(null);
  const userName = getUserDisplayName(userSession);
  const userNameShort = userName.split(" ")[0] || userName;
  const userInitial = getUserInitial(userName);

  const isActive = (path) => {
    const normalizedPath = String(path || "").split("?")[0].split("#")[0] || "/";

    if (path === "/") {
      return location.pathname === "/";
    }

    if (normalizedPath === "/shop") {
      return location.pathname === "/shop" || location.pathname.startsWith("/products");
    }

    return location.pathname.startsWith(normalizedPath);
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
    setProfileOpen(false);
    setProfileEditMode(false);
    setProfileError("");
    setProfileSuccess("");
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

  useEffect(() => {
    const syncUserSession = () => {
      setUserSession(getStoredUserSession());
    };

    const handleStorage = (event) => {
      if (
        event.key &&
        event.key !== USER_SESSION_STORAGE_KEY &&
        event.key !== USER_SESSION_TEMP_STORAGE_KEY
      ) {
        return;
      }

      syncUserSession();
    };

    syncUserSession();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(USER_SESSION_UPDATED_EVENT, syncUserSession);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(USER_SESSION_UPDATED_EVENT, syncUserSession);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        profilePanelRef.current?.contains(target) ||
        profileButtonRef.current?.contains(target)
      ) {
        return;
      }

      setProfileOpen(false);
      setProfileEditMode(false);
      setProfileError("");
      setProfileSuccess("");
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [profileOpen]);

  useEffect(() => {
    const user = userSession?.user;

    if (!user) {
      setProfileDraft({ fullName: "", email: "", phone: "" });
      setProfileEditMode(false);
      setProfileOpen(false);
      setProfileError("");
      setProfileSuccess("");
      return;
    }

    setProfileDraft({
      fullName: String(user.fullName || ""),
      email: String(user.email || ""),
      phone: String(user.phone || "")
    });
  }, [userSession]);

  const closeProfilePanel = () => {
    setProfileOpen(false);
    setProfileEditMode(false);
    setProfileError("");
    setProfileSuccess("");
  };

  const openProfileEditor = () => {
    const user = userSession?.user || {};

    setProfileDraft({
      fullName: String(user.fullName || ""),
      email: String(user.email || ""),
      phone: String(user.phone || "")
    });
    setProfileError("");
    setProfileSuccess("");
    setProfileEditMode(true);
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
    if (profileError) {
      setProfileError("");
    }
    if (profileSuccess) {
      setProfileSuccess("");
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!userSession?.user?.id) {
      setProfileError("Please log in again.");
      return;
    }

    const fullName = String(profileDraft.fullName || "").trim();
    const email = String(profileDraft.email || "").trim().toLowerCase();
    const phone = String(profileDraft.phone || "").replace(/\D/g, "");

    if (!fullName) {
      setProfileError("Full name is required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setProfileError("Please enter a valid phone number.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const updatedUser = await updateUserProfile(userSession.user.id, {
        fullName,
        email,
        phone
      });

      const persistent = Boolean(window.localStorage.getItem(USER_SESSION_STORAGE_KEY));

      setStoredUserSession(
        {
          token: String(userSession?.token || ""),
          user: updatedUser
        },
        { persistent }
      );

      setProfileSuccess("Profile updated.");
      setProfileEditMode(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileLogout = () => {
    clearStoredUserSession();
    closeProfilePanel();
    navigate("/");
  };

  return (
    <>
      <div
        className={cn(
          "relative z-[70] border-b text-[11px] uppercase tracking-[0.2em]",
          isDark
            ? "border-[#D6A85F]/20 bg-gradient-to-r from-[#120b08] via-[#231510] to-[#120b08] text-[#D6A85F]"
            : "border-hofo-walnut-dark/30 bg-gradient-to-r from-hofo-walnut-dark via-hofo-walnut to-hofo-walnut-dark text-hofo-accent"
        )}
      >
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
            ? isDark
              ? "border-b border-[#D6A85F]/16 bg-[#170e0b]/82 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : "border-b border-hofo-walnut/10 bg-hofo-cream/90 py-3 shadow-[0_10px_35px_rgba(30,16,8,0.12)] backdrop-blur-xl"
            : "bg-transparent py-4"
        )}
      >
        <div className="section-shell flex items-center justify-between gap-6">
          <Link to="/" className="z-50 flex items-end gap-2">
            <span className={cn("font-serif text-3xl font-bold tracking-tight sm:text-4xl", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>HOFO</span>
            <span
              className={cn(
                "hidden pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] sm:block",
                isDark ? "text-[#D6A85F]/80" : "text-hofo-walnut/60"
              )}
            >
              Atelier
            </span>
          </Link>

          <nav
            className={cn(
              "hidden items-center gap-2 rounded-full p-1.5 backdrop-blur-md md:flex xl:mx-4 xl:flex-1 xl:gap-1",
              isDark
                ? "border border-[#D6A85F]/16 bg-[#24160f]/55 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                : "border border-hofo-walnut/10 bg-white/65 shadow-[0_12px_30px_rgba(51,26,13,0.08)]"
            )}
          >
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
                        ? isDark
                          ? "text-[#1A0F0B]"
                          : "text-hofo-cream"
                        : isDark
                          ? "text-[#F5EDE3]/74 hover:bg-[#D6A85F]/15 hover:text-[#F5EDE3]"
                          : "text-hofo-walnut/70 hover:bg-hofo-beige/55 hover:text-hofo-walnut-dark"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-active-link"
                        className={cn(
                          "absolute inset-0 rounded-full",
                          isDark ? "bg-[#D6A85F]" : "bg-hofo-walnut-dark"
                        )}
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
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full shadow-sm hover:-translate-y-0.5",
                isDark
                  ? "border border-[#D6A85F]/25 bg-[#24160f]/55 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                  : "border border-hofo-walnut/15 bg-white/65 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              )}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              onClick={onToggleTheme}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full shadow-sm hover:-translate-y-0.5",
                isDark
                  ? "border border-[#D6A85F]/25 bg-[#24160f]/55 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                  : "border border-hofo-walnut/15 bg-white/65 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              )}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              to="/cart"
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full shadow-sm hover:-translate-y-0.5",
                isDark
                  ? "border border-[#D6A85F]/25 bg-[#24160f]/55 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                  : "border border-hofo-walnut/15 bg-white/65 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              )}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-hofo-teak text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>

            {userSession?.user ? (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={() => {
                    setProfileOpen((current) => !current);
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold hover:-translate-y-0.5",
                    isDark
                      ? "border border-[#D6A85F]/25 bg-[#24160f]/60 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                      : "border border-hofo-walnut/15 bg-white/75 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                  )}
                  aria-label="Open profile"
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold uppercase",
                      isDark ? "bg-[#D6A85F] text-[#1A0F0B]" : "bg-hofo-walnut-dark text-hofo-cream"
                    )}
                  >
                    {userInitial}
                  </span>
                  <span className="max-w-[88px] truncate text-sm normal-case tracking-normal">{userNameShort}</span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      ref={profilePanelRef}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={cn(
                        "absolute right-0 top-[calc(100%+10px)] z-[95] w-[320px] rounded-3xl border p-4 shadow-[0_24px_55px_rgba(18,10,6,0.32)] backdrop-blur-xl",
                        isDark
                          ? "border-[#D6A85F]/22 bg-[#170e0b]/94"
                          : "border-hofo-walnut/14 bg-hofo-cream/95"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold uppercase",
                            isDark ? "bg-[#D6A85F] text-[#1A0F0B]" : "bg-hofo-walnut-dark text-hofo-cream"
                          )}
                        >
                          {userInitial}
                        </span>
                        <div className="min-w-0">
                          <p className={cn("truncate text-sm font-semibold", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>{userName}</p>
                          <p className={cn("truncate text-xs", isDark ? "text-[#F5EDE3]/70" : "text-hofo-walnut/60")}>{userSession?.user?.email || ""}</p>
                        </div>
                      </div>

                      <div className="soft-divider my-4" />

                      {profileEditMode ? (
                        <form onSubmit={handleProfileSave} className="space-y-3">
                          <label className="block">
                            <span className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em]", isDark ? "text-[#F5EDE3]/70" : "text-hofo-walnut/62")}>Full Name</span>
                            <input
                              value={profileDraft.fullName}
                              onChange={(event) => handleProfileFieldChange("fullName", event.target.value)}
                              className={cn(
                                "h-10 w-full rounded-xl border px-3 text-sm outline-none",
                                isDark
                                  ? "border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3] placeholder:text-[#F5EDE3]/45"
                                  : "border-hofo-walnut/15 bg-white text-hofo-walnut-dark placeholder:text-hofo-walnut/40"
                              )}
                              placeholder="Your name"
                            />
                          </label>

                          <label className="block">
                            <span className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em]", isDark ? "text-[#F5EDE3]/70" : "text-hofo-walnut/62")}>Email</span>
                            <input
                              value={profileDraft.email}
                              onChange={(event) => handleProfileFieldChange("email", event.target.value)}
                              className={cn(
                                "h-10 w-full rounded-xl border px-3 text-sm outline-none",
                                isDark
                                  ? "border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3] placeholder:text-[#F5EDE3]/45"
                                  : "border-hofo-walnut/15 bg-white text-hofo-walnut-dark placeholder:text-hofo-walnut/40"
                              )}
                              placeholder="you@example.com"
                            />
                          </label>

                          <label className="block">
                            <span className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em]", isDark ? "text-[#F5EDE3]/70" : "text-hofo-walnut/62")}>Phone</span>
                            <input
                              value={profileDraft.phone}
                              onChange={(event) => handleProfileFieldChange("phone", event.target.value)}
                              className={cn(
                                "h-10 w-full rounded-xl border px-3 text-sm outline-none",
                                isDark
                                  ? "border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3] placeholder:text-[#F5EDE3]/45"
                                  : "border-hofo-walnut/15 bg-white text-hofo-walnut-dark placeholder:text-hofo-walnut/40"
                              )}
                              placeholder="9876543210"
                            />
                          </label>

                          {profileError && (
                            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{profileError}</p>
                          )}

                          {profileSuccess && (
                            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{profileSuccess}</p>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setProfileEditMode(false);
                                setProfileError("");
                                setProfileSuccess("");
                              }}
                              className={cn(
                                "inline-flex h-9 flex-1 items-center justify-center rounded-full border text-xs font-semibold uppercase tracking-[0.12em]",
                                isDark
                                  ? "border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                                  : "border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                              )}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={profileSaving}
                              className={cn(
                                "inline-flex h-9 flex-1 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.12em] disabled:opacity-65",
                                isDark
                                  ? "bg-[#D6A85F] text-[#1A0F0B]"
                                  : "bg-hofo-walnut-dark text-hofo-cream"
                              )}
                            >
                              {profileSaving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          <div className={cn("rounded-2xl border p-3", isDark ? "border-[#D6A85F]/22 bg-[#24160f]/45" : "border-hofo-walnut/12 bg-white/75") }>
                            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.13em]", isDark ? "text-[#F5EDE3]/62" : "text-hofo-walnut/55")}>Name</p>
                            <p className={cn("mt-1 text-sm font-semibold", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>{userSession?.user?.fullName || "-"}</p>
                          </div>
                          <div className={cn("rounded-2xl border p-3", isDark ? "border-[#D6A85F]/22 bg-[#24160f]/45" : "border-hofo-walnut/12 bg-white/75") }>
                            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.13em]", isDark ? "text-[#F5EDE3]/62" : "text-hofo-walnut/55")}>Email</p>
                            <p className={cn("mt-1 text-sm font-semibold", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>{userSession?.user?.email || "-"}</p>
                          </div>
                          <div className={cn("rounded-2xl border p-3", isDark ? "border-[#D6A85F]/22 bg-[#24160f]/45" : "border-hofo-walnut/12 bg-white/75") }>
                            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.13em]", isDark ? "text-[#F5EDE3]/62" : "text-hofo-walnut/55")}>Phone</p>
                            <p className={cn("mt-1 text-sm font-semibold", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>{userSession?.user?.phone || "-"}</p>
                          </div>

                          {profileError && (
                            <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{profileError}</p>
                          )}

                          {profileSuccess && (
                            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{profileSuccess}</p>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={openProfileEditor}
                              className={cn(
                                "inline-flex h-9 flex-1 items-center justify-center rounded-full border text-xs font-semibold uppercase tracking-[0.12em]",
                                isDark
                                  ? "border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                                  : "border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                              )}
                            >
                              Edit Profile
                            </button>
                            <button
                              type="button"
                              onClick={handleProfileLogout}
                              className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-red-300 bg-red-50 text-xs font-semibold uppercase tracking-[0.12em] text-red-700"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] hover:-translate-y-0.5",
                  isDark
                    ? "border border-[#D6A85F]/25 bg-[#24160f]/60 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                    : "border border-hofo-walnut/15 bg-white/75 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                )}
              >
                <User className="h-3.5 w-3.5" />
                Login
              </Link>
            )}

            <Link
              to="/my-orders"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] hover:-translate-y-0.5",
                isDark
                  ? "border border-[#D6A85F]/25 bg-[#24160f]/60 text-[#F5EDE3] hover:border-[#D6A85F] hover:text-[#D6A85F]"
                  : "border border-hofo-walnut/15 bg-white/75 text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              )}
            >
              Orders
            </Link>

            <Link
              to="/custom-order"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] hover:-translate-y-0.5",
                isDark
                  ? "bg-[#D6A85F] text-[#1A0F0B] hover:bg-[#e3bb79]"
                  : "bg-hofo-forest text-hofo-cream hover:bg-hofo-walnut-dark"
              )}
            >
              Get Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            className={cn(
              "z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-sm md:hidden",
              isDark
                ? "border border-[#D6A85F]/25 bg-[#24160f]/60 text-[#F5EDE3]"
                : "border border-hofo-walnut/15 bg-white/75 text-hofo-walnut-dark"
            )}
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
              className={cn(
                "fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm border-l p-6 shadow-[0_22px_50px_rgba(20,10,6,0.32)] md:hidden",
                isDark
                  ? "border-[#D6A85F]/20 bg-[#170e0b]"
                  : "border-hofo-walnut/15 bg-hofo-cream"
              )}
            >
              <div className="mb-8 flex items-center justify-between">
                <p className={cn("hofo-eyebrow", isDark && "text-[#D6A85F]")}>Navigation</p>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border",
                    isDark ? "border-[#D6A85F]/22 text-[#F5EDE3]" : "border-hofo-walnut/15 text-hofo-walnut"
                  )}
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
                            ? isDark
                              ? "text-[#1A0F0B]"
                              : "text-hofo-cream"
                            : isDark
                              ? "text-[#F5EDE3] hover:bg-[#D6A85F]/12"
                              : "text-hofo-walnut-dark hover:bg-hofo-beige/50"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="mobile-active-link"
                            className={cn(
                              "absolute inset-0 rounded-2xl",
                              isDark ? "bg-[#D6A85F]" : "bg-hofo-walnut-dark"
                            )}
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
                  onClick={onToggleTheme}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                    isDark
                      ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                      : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                  )}
                  type="button"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSearch();
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                    isDark
                      ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                      : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                  )}
                  type="button"
                >
                  <Search className="h-4 w-4" />
                  Search Catalog
                </button>
                <Link
                  to="/cart"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                    isDark
                      ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                      : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  View Cart ({cartCount})
                </Link>
                {userSession?.user ? (
                  <Link
                    to="/my-orders"
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold",
                      isDark
                        ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                        : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                    )}
                  >
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold uppercase",
                      isDark ? "bg-[#D6A85F] text-[#1A0F0B]" : "bg-hofo-walnut-dark text-hofo-cream"
                    )}>
                      {userInitial}
                    </span>
                    <span className="max-w-[140px] truncate normal-case">{userName}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                      isDark
                        ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                        : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                    )}
                  >
                    <User className="h-4 w-4" />
                    Login / Sign Up
                  </Link>
                )}
                <Link
                  to="/my-orders"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                    isDark
                      ? "border border-[#D6A85F]/22 bg-[#24160f]/65 text-[#F5EDE3]"
                      : "border border-hofo-walnut/20 bg-white/80 text-hofo-walnut-dark"
                  )}
                >
                  My Orders
                </Link>
                <Link
                  to="/custom-order"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]",
                    isDark ? "bg-[#D6A85F] text-[#1A0F0B]" : "bg-hofo-forest text-hofo-cream"
                  )}
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
              className={cn(
                "fixed left-1/2 top-[16%] z-[89] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 rounded-3xl border p-5 shadow-[0_28px_60px_rgba(18,10,6,0.35)] backdrop-blur-xl",
                isDark
                  ? "border-[#D6A85F]/20 bg-[#170e0b]/92"
                  : "border-hofo-walnut/15 bg-hofo-cream/95"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark")}>Search Catalog</p>
                <button
                  onClick={() => setSearchOpen(false)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border",
                    isDark ? "border-[#D6A85F]/25 text-[#F5EDE3]" : "border-hofo-walnut/18 text-hofo-walnut-dark"
                  )}
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border p-2.5",
                  isDark ? "border-[#D6A85F]/18 bg-[#24160f]/80" : "border-hofo-walnut/12 bg-white/80"
                )}
              >
                <Search className={cn("ml-1 h-4 w-4", isDark ? "text-[#F5EDE3]/65" : "text-hofo-walnut/55")} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  autoFocus
                  placeholder="Search catalog"
                  className={cn(
                    "h-10 flex-1 bg-transparent px-2 text-sm outline-none",
                    isDark ? "text-[#F5EDE3] placeholder:text-[#F5EDE3]/45" : "text-hofo-walnut-dark placeholder:text-hofo-walnut/45"
                  )}
                />
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
