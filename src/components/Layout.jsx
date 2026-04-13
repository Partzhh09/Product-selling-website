import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-x-clip text-hofo-walnut-dark">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-14 top-24 h-52 w-52 rounded-full bg-hofo-accent/25 blur-3xl" />
        <div className="absolute right-0 top-[32%] h-56 w-56 rounded-full bg-hofo-forest/18 blur-3xl" />
        <div className="absolute bottom-6 left-1/4 h-44 w-44 rounded-full bg-hofo-teak/20 blur-3xl" />
      </div>

      <Navbar />

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
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/35 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(15,76,48,0.35)] hover:-translate-y-1 hover:bg-[#1fae52] sm:bottom-7 sm:right-7"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
