import { Upload, MessageCircle, Send } from "lucide-react";

export function CustomOrder() {
  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative overflow-hidden rounded-[30px] border border-hofo-walnut/10 bg-hofo-walnut-dark p-7 text-hofo-cream md:p-10">
            <div className="absolute inset-0 wood-texture opacity-15 mix-blend-soft-light" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-accent">Custom Atelier</p>
              <h1 className="mt-3 font-serif text-4xl leading-[0.92] text-hofo-cream md:text-6xl">
                Build Something
                <br />
                Beautifully Yours.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-hofo-cream/75">
                Share your dimensions, preferred wood, and design intent. Our team will return with a tailored quote and production timeline.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm">
                {[
                  "Initial response within 24 hours",
                  "Material and finish suggestions included",
                  "Bulk and hospitality orders welcome",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-hofo-cream/82">
                    <span className="h-1.5 w-1.5 rounded-full bg-hofo-accent" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-white/15 bg-white/8 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-accent">Direct Contact</p>
                <p className="mt-3 text-sm text-hofo-cream/82">hello@hofowood.com</p>
                <p className="text-sm text-hofo-cream/82">+91 98765 43210</p>
              </div>
            </div>
          </aside>

          <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <p className="hofo-eyebrow">Inquiry Form</p>
              <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark">Custom Orders & Inquiries</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-hofo-walnut/72">
                Tell us what you need and we will shape the right product for your space, brand, or gifting requirement.
              </p>
            </div>

            <form className="space-y-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="soft-divider" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="productType" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Product Type</label>
                  <select
                    id="productType"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="kitchenware">Kitchenware</option>
                    <option value="decor">Home Decor</option>
                    <option value="furniture">Small Furniture</option>
                    <option value="corporate">Corporate Gifting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="woodPref" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Wood Preference</label>
                  <select
                    id="woodPref"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                  >
                    <option value="">Select wood type</option>
                    <option value="teak">Teak Wood</option>
                    <option value="mango">Mango Wood</option>
                    <option value="sheesham">Sheesham (Rosewood)</option>
                    <option value="bamboo">Bamboo</option>
                    <option value="any">Open to suggestions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dimensions" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Approx. Dimensions</label>
                  <input
                    type="text"
                    id="dimensions"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="e.g., 12x8x2 inches"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Quantity Required</label>
                  <input
                    type="number"
                    id="quantity"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Reference Image (Optional)</label>
                  <div className="rounded-2xl border-2 border-dashed border-hofo-walnut/18 bg-white/65 p-7 text-center hover:border-hofo-teak/40 hover:bg-white">
                    <Upload className="mx-auto mb-3 h-8 w-8 text-hofo-teak" />
                    <p className="text-sm text-hofo-walnut/74">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-hofo-walnut/50">PNG, JPG, PDF up to 5MB</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="instructions" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">Special Instructions</label>
                  <textarea
                    id="instructions"
                    rows={4}
                    className="w-full rounded-2xl border border-hofo-walnut/15 bg-white px-4 py-3 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                    placeholder="Tell us more about your requirements..."
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak"
                >
                  <Send className="h-4 w-4" />
                  Submit Inquiry
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#1fae52]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Quick WhatsApp Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
