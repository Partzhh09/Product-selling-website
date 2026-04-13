import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Hammer,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { premiumWoodenImage } from "@/lib/defaultProducts";

const featuredProducts = [
  {
    id: 1,
    name: "Artisan Teak Chopping Board",
    price: "₹1,499",
    tagline: "End-grain durability",
    image: premiumWoodenImage
  },
  {
    id: 2,
    name: "Hand-Carved Serving Bowl",
    price: "₹2,299",
    tagline: "Perfect for salads",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&h=2000&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Minimalist Wooden Spoons Set",
    price: "₹899",
    tagline: "Set of 4 essentials",
    image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2000&h=2000&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Walnut Wood Serving Tray",
    price: "₹3,499",
    tagline: "Elegant hosting",
    image: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=2000&h=2000&auto=format&fit=crop"
  }
];

const timelineSteps = [
  { title: "Sustainable Wood Sourcing", desc: "Ethically harvested from certified forests.", icon: Leaf },
  { title: "Cutting & Sizing", desc: "Precision cutting to maximize material usage.", icon: Hammer },
  { title: "Shaping & Carving", desc: "Hand-shaped by master artisans.", icon: Hammer },
  { title: "Sanding & Smoothing", desc: "Multiple passes for a buttery-smooth finish.", icon: Hammer },
  { title: "Finishing & Coating", desc: "Food-safe natural oils applied by hand.", icon: ShieldCheck },
  { title: "Quality Check & Dispatch", desc: "Rigorous inspection before export packaging.", icon: CheckCircle2 },
];

const craftPillars = [
  {
    icon: ShieldCheck,
    title: "Food-Safe Process",
    desc: "Natural oils, tested finishes, and strict hygiene from workshop to packing.",
  },
  {
    icon: Hammer,
    title: "Built by Artisans",
    desc: "Every curve is shaped by hand with techniques passed across generations.",
  },
  {
    icon: Leaf,
    title: "Sustainable Timber",
    desc: "Ethically sourced hardwoods selected for durability and low material waste.",
  },
  {
    icon: Globe,
    title: "Global-Grade Quality",
    desc: "Precision finishing and quality checks trusted by export partners worldwide.",
  },
];

const trustStats = [
  { value: "50k+", label: "Units Crafted / Month" },
  { value: "120+", label: "Master Artisans" },
  { value: "25+", label: "Countries Served" },
  { value: "4.9/5", label: "Average Rating" },
];

export function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1.08, 1]);

  return (
    <div className="overflow-hidden pb-8">
      <section className="section-shell pt-6 md:pt-9">
        <div className="relative min-h-[78vh] overflow-hidden rounded-[34px] border border-hofo-walnut/12 shadow-[0_30px_70px_rgba(25,14,9,0.22)]">
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0"
          >
            <img
              src={premiumWoodenImage}
              alt="Premium wooden chopping board"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f140f]/88 via-[#2e1d14]/70 to-[#3f2a1f]/30" />
            <div className="absolute inset-0 bg-vignette" />
          </motion.div>

          <div className="relative z-10 grid min-h-[78vh] gap-10 px-6 py-14 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
            <div className="self-center text-white">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-hofo-accent backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Crafted in India
              </p>

              <h1 className="font-serif text-5xl leading-[0.9] tracking-tight text-white md:text-7xl lg:text-8xl">
                Quiet Luxury,
                <br />
                <span className="italic text-hofo-accent">in Every Grain.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/86 md:text-lg">
                Premium wooden kitchenware and decor, sustainably sourced and hand-finished for homes that value warmth, character, and longevity.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-hofo-accent px-7 text-sm font-semibold uppercase tracking-[0.16em] text-hofo-walnut-dark hover:-translate-y-0.5 hover:bg-hofo-beige"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/custom-order"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/38 bg-white/5 px-7 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-white/70 hover:bg-white/10"
                >
                  Start Custom Order
                </Link>
              </div>
            </div>

            <div className="self-end lg:self-center">
              <div className="glass-card rounded-3xl p-6 text-hofo-walnut-dark md:p-7">
                <p className="hofo-eyebrow">Studio Favorite</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-hofo-walnut-dark">
                  Artisan Teak Chopping Board
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-hofo-walnut/72">
                  End-grain durability, fluid edges, and a food-safe finish made for daily prep and serving.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.14em] text-hofo-walnut/65">
                  <div className="rounded-2xl border border-hofo-walnut/10 bg-white/70 p-3">
                    <p className="font-semibold text-hofo-walnut-dark">Material</p>
                    <p className="mt-2">100% Teak</p>
                  </div>
                  <div className="rounded-2xl border border-hofo-walnut/10 bg-white/70 p-3">
                    <p className="font-semibold text-hofo-walnut-dark">Finish</p>
                    <p className="mt-2">Food-Safe Oil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell relative -mt-9 md:-mt-12">
        <div className="grain-card rounded-[26px] p-6 md:p-8">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {trustStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-hofo-walnut/8 bg-white/65 p-4 text-center">
                <p className="font-serif text-4xl leading-none text-hofo-walnut-dark md:text-5xl">{item.value}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-hofo-walnut/65">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-24">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hofo-eyebrow">Why HOFO</p>
            <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">Designed for Daily Rituals</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-hofo-walnut/72">
            We blend artisan detail with modern consistency, giving every piece the warmth of handmade work and the precision of export-grade finishing.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {craftPillars.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className="grain-card rounded-3xl p-6"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-hofo-beige text-hofo-teak">
                <pillar.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl leading-none text-hofo-walnut-dark">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-hofo-walnut/72">{pillar.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell pb-22">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hofo-eyebrow">Featured Products</p>
            <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">Signature Collection</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-hofo-teak hover:text-hofo-walnut-dark"
          >
            View Entire Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, i) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={cn(
                "group overflow-hidden rounded-[28px] border border-hofo-walnut/10 bg-white/78 shadow-[0_15px_30px_rgba(28,16,8,0.08)]",
                i % 3 === 0 && "xl:-mt-6",
                i % 3 === 2 && "xl:mt-6"
              )}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
                <p className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-hofo-teak">
                  {product.tagline}
                </p>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-2xl leading-tight text-hofo-walnut-dark transition-colors group-hover:text-hofo-teak">
                  {product.name}
                </h3>
                <p className="mt-3 text-lg font-semibold text-hofo-walnut-dark">{product.price}</p>
                <Link
                  to={`/products/${product.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut/70 hover:text-hofo-teak"
                >
                  See Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-hofo-walnut-dark py-24 text-hofo-cream">
        <div className="absolute inset-0 wood-texture opacity-10 mix-blend-soft-light" />
        <div className="section-shell relative z-10">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-hofo-accent">From Forest to Table</p>
            <h2 className="mt-3 font-serif text-4xl leading-none text-hofo-accent md:text-6xl">The Making Journey</h2>
            <p className="mt-4 text-sm leading-relaxed text-hofo-cream/72">
              From timber selection to final polishing, every step is designed to preserve natural character while achieving dependable everyday performance.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {timelineSteps.map((step, i) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                className="rounded-3xl border border-white/12 bg-white/6 p-6 backdrop-blur-sm"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-hofo-accent/15 text-hofo-accent">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-3xl leading-none text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-hofo-cream/72">{step.desc}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/factory"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-hofo-accent px-7 text-sm font-semibold uppercase tracking-[0.14em] text-hofo-accent hover:bg-hofo-accent hover:text-hofo-walnut-dark"
            >
              Tour Our Facility
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell py-22">
        <div className="mb-10 text-center">
          <p className="hofo-eyebrow">Voices</p>
          <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">Loved by Customers</h2>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-5 no-scrollbar snap-x">
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              className="grain-card min-w-[290px] snap-center rounded-3xl p-6 sm:min-w-[360px]"
            >
              <div className="mb-4 flex gap-1 text-amber-500">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-hofo-walnut/78">
                "The craftsmanship is stunning. We ordered a custom serving set for our studio kitchen and it still looks brand new after daily use."
              </p>

              <div className="mt-6 flex items-center gap-3">
                <img
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt="Customer"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-hofo-walnut-dark">Sarah Jenkins</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-hofo-walnut/55">Verified Buyer, UK</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
