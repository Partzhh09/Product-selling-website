import { Link, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ArrowRight, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "hofo_theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Layout() {
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const isDark = theme === "dark";
  const shouldShowStickyCta = useMemo(
    () => showStickyCta && location.pathname !== "/custom-order",
    [showStickyCta, location.pathname]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(isDark ? "theme-dark" : "theme-light");
    root.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDark, theme]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 420);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleToggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-clip transition-colors duration-500",
        isDark ? "text-[#F5EDE3]" : "text-hofo-walnut-dark"
      )}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute -left-14 top-24 h-52 w-52 rounded-full blur-3xl",
            isDark ? "bg-[#D6A85F]/20" : "bg-hofo-accent/25"
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-[32%] h-56 w-56 rounded-full blur-3xl",
            isDark ? "bg-[#8C5C2D]/16" : "bg-hofo-forest/18"
          )}
        />
        <div
          className={cn(
            "absolute bottom-6 left-1/4 h-44 w-44 rounded-full blur-3xl",
            isDark ? "bg-[#C2884A]/16" : "bg-hofo-teak/20"
          )}
        />
      </div>

      <Navbar theme={theme} onToggleTheme={handleToggleTheme} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      
      <a
        href="https://wa.me/916356083197"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/35 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(15,76,48,0.35)] hover:-translate-y-1 hover:bg-[#1fae52] sm:bottom-7 sm:right-7"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      <AnimatePresence>
        {shouldShowStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-5 left-5 z-50 sm:bottom-7 sm:left-7"
          >
            <Link
              to="/custom-order"
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-full px-5 text-xs font-semibold uppercase tracking-[0.16em] shadow-[0_14px_28px_rgba(20,10,6,0.25)]",
                isDark
                  ? "border border-[#D6A85F]/40 bg-[#D6A85F] text-[#1A0F0B] hover:bg-[#e3bb79]"
                  : "border border-hofo-forest/25 bg-hofo-forest text-hofo-cream hover:bg-hofo-walnut-dark"
              )}
            >
              Get Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
