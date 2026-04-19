import { Link } from "react-router-dom";
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-hofo-walnut/10 bg-hofo-walnut-dark text-hofo-cream">
      <div className="absolute inset-0 wood-texture opacity-15 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />

      <div className="section-shell relative z-10 py-16 md:py-20">
        <div className="mb-14 rounded-3xl border border-hofo-accent/30 bg-hofo-accent/8 p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-accent">Stay in the Grain</p>
              <h2 className="mt-3 font-serif text-4xl leading-[0.95] text-hofo-cream md:text-5xl">
                Seasonal Drops,
                <br />
                Craft Stories, Care Tips.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-hofo-cream/72">
                Get a concise monthly dispatch from our workshop with new launches and behind-the-scenes pieces from our artisans.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <label htmlFor="footer-newsletter" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream/75">
                Email Address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-full border border-white/20 bg-white/90 px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/40 focus:border-hofo-accent focus:outline-none"
                />
                <button className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-hofo-accent px-5 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut-dark hover:-translate-y-0.5 hover:bg-hofo-beige">
                  Subscribe
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="font-serif text-5xl font-semibold tracking-tight text-hofo-accent">HOFO</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-hofo-cream/70">
              Crafted by Nature. Perfected by Hand. Premium wooden kitchenware and decor, designed for everyday rituals and made responsibly in India.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-hofo-cream/70 hover:border-hofo-accent hover:text-hofo-accent">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-hofo-cream/70 hover:border-hofo-accent hover:text-hofo-accent">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-hofo-cream/70 hover:border-hofo-accent hover:text-hofo-accent">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-accent">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-hofo-cream/72">
              <li><Link to="/products" className="hover:text-hofo-accent">All Products</Link></li>
              <li><Link to="/custom-order" className="hover:text-hofo-accent">Custom Orders</Link></li>
              <li><Link to="/factory" className="hover:text-hofo-accent">Factory Tour</Link></li>
              <li><Link to="/blog" className="hover:text-hofo-accent">HOFO Journal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-accent">Contact</h3>
            <ul className="mt-4 space-y-4 text-sm text-hofo-cream/72">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-hofo-accent" />
                <span>123 Woodcrafter Lane, Jaipur, Rajasthan, India 302001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-hofo-accent" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-hofo-accent" />
                <span>hello@hofowood.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/12 pt-6 text-xs text-hofo-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HOFO Manufacturing. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/products" className="hover:text-hofo-accent">Catalog</Link>
            <Link to="/custom-order" className="hover:text-hofo-accent">Bulk Orders</Link>
            <Link to="/factory" className="hover:text-hofo-accent">Facility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
