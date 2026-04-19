import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { signupUser } from "@/lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    if (!/^\d{10,15}$/.test(normalizedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms to create your account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signupUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizedPhone,
        password
      });

      setSuccess(`Account created successfully for ${user?.fullName || "you"}. You can sign in now.`);
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);

      window.setTimeout(() => {
        window.location.assign("/login");
      }, 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative overflow-hidden rounded-[30px] border border-hofo-walnut/10 bg-hofo-forest p-7 text-hofo-cream md:p-10">
            <div className="absolute inset-0 wood-texture opacity-15 mix-blend-soft-light" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-accent">Create Your Account</p>
              <h1 className="mt-3 font-serif text-4xl leading-[0.92] text-hofo-cream md:text-6xl">
                Join the
                <br />
                HOFO Circle.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-hofo-cream/75">
                Register once to save addresses, track every order, and discover exclusive artisan drops.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm">
                {[
                  "Faster checkout for future orders",
                  "Wishlist and product history",
                  "Priority updates on new collections",
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
              <p className="hofo-eyebrow">New Member</p>
              <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark">Create your account</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-hofo-walnut/72">
                Fill in your details and start shopping handcrafted essentials with a personalized account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="signup-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="John Doe"
                      className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                    <input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="signup-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
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

                <div>
                  <label htmlFor="signup-confirm-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/40" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter your password"
                      className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-12 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-hofo-walnut/55 hover:bg-hofo-beige/55 hover:text-hofo-walnut-dark"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="inline-flex items-start gap-3 text-sm text-hofo-walnut/75">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-hofo-walnut/25 text-hofo-teak focus:ring-hofo-teak"
                />
                I agree to the terms and privacy policy.
              </label>

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
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hofo-forest px-6 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-walnut-dark disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-hofo-walnut/72">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-hofo-teak hover:text-hofo-walnut-dark">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
