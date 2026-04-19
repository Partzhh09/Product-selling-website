import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { loginUser } from "@/lib/api";
import { setStoredUserSession } from "@/lib/session";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim().toLowerCase(),
        password
      });

      setStoredUserSession(result, { persistent: rememberMe });

      setSuccess(`Welcome back, ${result?.user?.fullName || "member"}. Login successful.`);

      window.setTimeout(() => {
        navigate("/my-orders");
      }, 650);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative overflow-hidden rounded-[30px] border border-hofo-walnut/10 bg-hofo-walnut-dark p-7 text-hofo-cream md:p-10">
            <div className="absolute inset-0 wood-texture opacity-15 mix-blend-soft-light" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-accent">HOFO Member Access</p>
              <h1 className="mt-3 font-serif text-4xl leading-[0.92] text-hofo-cream md:text-6xl">
                Welcome Back,
                <br />
                Crafted Comfort Awaits.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-hofo-cream/75">
                Sign in to track orders, save favorites, and move faster through checkout.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm">
                {[
                  "Track active and past orders",
                  "Save products to your wishlist",
                  "Faster repeat purchases",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-hofo-cream/82">
                    <span className="h-1.5 w-1.5 rounded-full bg-hofo-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <p className="hofo-eyebrow">Account Login</p>
              <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark">Sign in to your account</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-hofo-walnut/72">
                Enter your credentials below to continue your shopping journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-12 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-hofo-walnut/55 hover:bg-hofo-beige/55 hover:text-hofo-walnut-dark"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-hofo-walnut/75 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-hofo-walnut/25 text-hofo-teak focus:ring-hofo-teak"
                  />
                  Remember me
                </label>

                <a href="#" className="font-medium text-hofo-teak hover:text-hofo-walnut-dark">
                  Forgot password?
                </a>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              {success && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? "Signing In..." : "Log In"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-hofo-walnut/72">
              Do not have an account?{" "}
              <Link to="/signup" className="font-semibold text-hofo-teak hover:text-hofo-walnut-dark">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
