import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  Bot,
  Download,
  Globe,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Users
} from "lucide-react";
import { addToCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const heroImage =
  "https://img.freepik.com/free-photo/wooden-product-display-podium-with-blurred-nature-leaves-background-generative-ai_91128-2266.jpg?semt=ais_hybrid&w=740&q=80";

const aboutImage =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1800&auto=format&fit=crop";

const storyImage =
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2000&auto=format&fit=crop";

const signatureProducts = [
  {
    id: "teak-board",
    name: "Tissue-box",
    price: 1899,
    image: "https://customcraftltd.com/wp-content/uploads/2024/02/Bespoke-Wooden-Bottle-Caddy.webp"
  },
  {
    id: "serving-tray",
    name: "Wooden Water Bottle",
    price: 2599,
    image: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29vZCUyMHByb2R1Y3RzfGVufDB8fDB8fHww"
  },
  {
    id: "spice-rack",
    name: "Minimal Spice Dock",
    price: 1499,
    image: "https://mytype.store/cdn/shop/files/DSC00575.jpg?v=1758694874&width=533"
  },
  {
    id: "serving-board",
    name: "Laptop Stand",
    price: 3299,
    image: "https://www.yankodesign.com/images/design_news/2020/03/253714/08_wooden_LaptopStand_yankodesign_2.jpg"
  }
];

const stats = [
  { icon: ShoppingBag, label: "Units Crafted", value: "50K+" },
  { icon: Users, label: "Master Artisans", value: "120+" },
  { icon: Globe, label: "Countries Served", value: "25+" },
  { icon: Star, label: "Average Rating", value: "4.9" }
];

const testimonials = [
  {
    name: "Ananya Shah",
    place: "Mumbai, India",
    avatar: "https://i.pravatar.cc/140?img=42",
    review:
      "Every edge feels intentional. The board sits on my counter like a design object, not just a kitchen tool."
  },
  {
    name: "Liam Parker",
    place: "Melbourne, Australia",
    avatar: "https://i.pravatar.cc/140?img=33",
    review:
      "The finish is incredible, the grain is rich, and the quality is exactly what luxury craftsmanship should feel like."
  },
  {
    name: "Sofia Mendes",
    place: "Lisbon, Portugal",
    avatar: "https://i.pravatar.cc/140?img=48",
    review:
      "HOFO Atelier nailed utility and elegance together. It feels curated, warm, and made to last for years."
  },
  {
    name: "Rohan Iyer",
    place: "Bengaluru, India",
    avatar: "https://i.pravatar.cc/140?img=12",
    review:
      "Our custom order experience was smooth end to end. The craftsmanship and communication were both premium."
  }
];

export function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 520], [0, 72]);
  const [addedProductId, setAddedProductId] = useState("");

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });

    setAddedProductId(product.id);
    window.setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? "" : current));
    }, 1000);
  };

  return (
    <div className="overflow-hidden pb-24 pt-6 md:pt-8">
      <section className="section-shell">
        <div className="relative min-h-[80vh] overflow-hidden rounded-[24px] border border-[color:var(--surface-border)] shadow-[0_30px_70px_rgba(25,14,9,0.25)] md:rounded-[30px]">
          <motion.div style={{ y: heroY }} className="absolute inset-0 scale-[1.08]">
            <img src={heroImage} alt="HOFO Atelier wooden craft scene" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1d120f]/86 via-[#2a1913]/62 to-[#4c301f]/28" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-black/10 to-black/0" />
          </motion.div>

          <div className="relative z-10 grid min-h-[80vh] gap-8 px-5 py-10 sm:px-7 md:px-10 md:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:px-14">
            <div className="self-center text-[#F5EDE3]">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#D6A85F]" />
                Crafted in India
              </p>

              <h1 className="font-serif text-5xl leading-[0.9] tracking-tight sm:text-6xl lg:text-8xl">
                Quiet Luxury,
                <br />
                <span className="text-[#D6A85F]">in Every Grain</span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#F5EDE3]/86 sm:text-base md:text-lg">
                Premium handcrafted wooden kitchenware, made for calm homes that value craftsmanship, natural materials, and timeless daily rituals.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#D6A85F] px-7 text-xs font-semibold uppercase tracking-[0.15em] text-[#1A0F0B] shadow-[0_12px_24px_rgba(214,168,95,0.35)] hover:-translate-y-0.5 hover:bg-[#e5ba74]"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/custom-order"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/38 bg-white/7 px-7 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:border-white/72 hover:bg-white/12"
                >
                  Start Custom Order
                </Link>
              </div>
            </div>

            <div className="self-end lg:self-center">
              <motion.article
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.55 }}
                className="glass-card rounded-[20px] p-5 text-[color:var(--page-text-primary)] md:p-6"
              >
                <p className="hofo-eyebrow">Studio Feature</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">Artisan Teak Chopping Board</h2>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--page-text-secondary)]">
                  End-grain stability, hand-sanded edges, and a naturally food-safe finish built for daily prep and elegant serving.
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] px-3 py-1.5">Material: Teak</span>
                  <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] px-3 py-1.5">Finish: Natural Oil</span>
                </div>
              </motion.article>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-7 md:mt-9">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.07, duration: 0.45 }}
              whileHover={{ y: -5 }}
              className="grain-card rounded-[18px] p-5"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--gold-accent)]/15 text-[color:var(--gold-accent)]">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="font-serif text-4xl leading-none text-[color:var(--page-text-primary)]">{item.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--page-text-secondary)]">{item.label}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-16 grid gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="space-y-4"
        >
          <p className="hofo-eyebrow">Designed for Daily Rituals</p>
          <h2 className="font-serif text-4xl leading-[0.96] text-[color:var(--page-text-primary)] md:text-6xl">
            Objects that age beautifully,
            <br />
            with your home.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-[color:var(--page-text-secondary)] md:text-base">
            HOFO Atelier pieces are made to be touched, used, washed, and passed down. We obsess over proportion, grain direction, and finish so each product feels quiet, warm, and enduring.
          </p>
          <Link
            to="/factory"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--page-text-primary)] hover:-translate-y-0.5"
          >
            Tour Our Process
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[22px] border border-[color:var(--surface-border)] shadow-[0_18px_42px_rgba(24,13,9,0.16)]">
            <img src={aboutImage} alt="HOFO Atelier craft" className="h-[440px] w-full object-cover" />
          </div>
          <div className="glass-card absolute -bottom-5 left-4 right-4 rounded-2xl p-4 sm:left-6 sm:right-auto sm:w-[74%]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-accent)]">Craft Standard</p>
            <p className="mt-1 text-sm text-[color:var(--page-text-secondary)]">
              Hand-finished in small batches, inspected for grain continuity, durability, and food-safe finish quality.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="section-shell mt-24">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="hofo-eyebrow">Signature Collection</p>
            <h2 className="mt-2 font-serif text-4xl leading-none text-[color:var(--page-text-primary)] md:text-6xl">Curated Best Sellers</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--gold-accent)] hover:opacity-85"
          >
            View Full Shop
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {signatureProducts.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group overflow-hidden rounded-[20px] border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] shadow-[0_14px_28px_rgba(28,16,8,0.1)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <h3 className="font-serif text-2xl leading-tight text-[color:var(--page-text-primary)]">{product.name}</h3>
                <p className="mt-2 text-sm font-semibold text-[color:var(--page-text-secondary)]">Rs.{product.price.toLocaleString("en-IN")}</p>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={cn(
                    "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border text-xs font-semibold uppercase tracking-[0.14em] transition-all",
                    addedProductId === product.id
                      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                      : "border-[color:var(--surface-border)] bg-[color:var(--surface-card-strong)] text-[color:var(--page-text-primary)] hover:-translate-y-0.5"
                  )}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {addedProductId === product.id ? "Added" : "Add to Cart"}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="relative overflow-hidden rounded-[24px] border border-[#D6A85F]/20 bg-gradient-to-br from-[#130b08] via-[#251711] to-[#3b2418] px-6 py-14 text-[#F5EDE3] md:px-12 md:py-18">
          <div className="absolute inset-0 opacity-18">
            <img src={storyImage} alt="HOFO Atelier workshop" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/58 to-black/32" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.55 }}
            className="relative z-10 mx-auto max-w-3xl text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D6A85F]">The Making Journey</p>
            <h2 className="mt-3 font-serif text-4xl leading-[0.95] md:text-6xl">From Timber Selection to Final Polish</h2>
            <p className="mt-5 text-sm leading-relaxed text-[#F5EDE3]/82 md:text-base">
              Each HOFO piece moves through a deliberate process, from kiln treatment and grain alignment to hand-finishing and quality approval. The result is utility wrapped in quiet elegance.
            </p>
            <Link
              to="/factory"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D6A85F] bg-[#D6A85F]/10 px-7 text-xs font-semibold uppercase tracking-[0.15em] text-[#D6A85F] hover:bg-[#D6A85F] hover:text-[#1A0F0B]"
            >
              Tour Our Facility
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="mb-8 text-center">
          <p className="hofo-eyebrow">Testimonials</p>
          <h2 className="mt-2 font-serif text-4xl leading-none text-[color:var(--page-text-primary)] md:text-6xl">Loved Across Homes</h2>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto pb-3 no-scrollbar">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="grain-card min-w-[290px] snap-center rounded-[18px] p-5 sm:min-w-[360px]"
            >
              <div className="mb-4 flex gap-1 text-[#D6A85F]">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={`${item.name}-${starIndex}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[color:var(--page-text-secondary)]">"{item.review}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-[color:var(--page-text-primary)]">{item.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--page-text-secondary)]">{item.place}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-24 grid gap-5 xl:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grain-card rounded-[20px] p-6"
        >
          <p className="hofo-eyebrow">AI Product Recommendation</p>
          <h3 className="mt-2 font-serif text-3xl leading-tight text-[color:var(--page-text-primary)]">Your Ritual Match (Preview)</h3>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--page-text-secondary)]">
            Based on your usage style, we would recommend the Artisan Teak Board + Walnut Service Tray combination for prep-to-table workflow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em]">Material: Teak + Walnut</span>
            <span className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em]">Use Case: Daily Chef Prep</span>
          </div>
          <button
            type="button"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card-strong)] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--page-text-primary)]"
          >
            <Bot className="h-3.5 w-3.5" />
            Enable AI Recommender
          </button>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grain-card rounded-[20px] p-6"
        >
          <p className="hofo-eyebrow">Order Tracking Preview</p>
          <h3 className="mt-2 font-serif text-3xl leading-tight text-[color:var(--page-text-primary)]">Track Every Milestone</h3>

          <div className="mt-5 rounded-2xl border border-[color:var(--surface-border)] bg-[color:var(--surface-card)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--page-text-secondary)]">Order ID</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--page-text-primary)]">ORD-20260419-8124</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                In Transit
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#C8A97E] to-[#D6A85F]" />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--page-text-secondary)]">
              <span>Placed</span>
              <span>Packed</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-card-strong)] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--page-text-primary)]"
            >
              <Truck className="h-3.5 w-3.5" />
              Track Order
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--gold-accent)] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#1A0F0B]"
            >
              <Download className="h-3.5 w-3.5" />
              Download Invoice
            </button>
          </div>
        </motion.article>
      </section>

      <section className="section-shell mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.52 }}
          className="relative overflow-hidden rounded-[22px] border border-[color:var(--surface-border)] bg-gradient-to-r from-[#d8b58a] via-[#c8a97e] to-[#b08963] p-6 text-[#1A0F0B] shadow-[0_18px_40px_rgba(104,68,38,0.28)] md:p-9"
        >
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-14 right-0 h-44 w-44 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Newsletter</p>
              <h3 className="mt-2 font-serif text-4xl leading-[0.95] md:text-5xl">Seasonal Drops, Craft Stories, Care Tips</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1A0F0B]/82 md:text-base">
                Receive atelier updates, limited product releases, and expert care guides for your wooden pieces.
              </p>
            </div>

            <form className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="h-12 flex-1 rounded-full border border-white/45 bg-white/88 px-4 text-sm text-[#1A0F0B] placeholder:text-[#1A0F0B]/46 outline-none"
              />
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#1A0F0B] px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#F5EDE3] hover:bg-black"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
