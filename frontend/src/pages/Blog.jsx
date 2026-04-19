import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Search, Share2, User } from "lucide-react";
import { motion } from "motion/react";

const articles = [
  {
    id: 1,
    title: "Care tips for wooden kitchen utensils",
    excerpt: "Learn how to properly clean, oil, and maintain your wooden spoons and spatulas to ensure they last a lifetime without cracking or splintering.",
    image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2070&auto=format&fit=crop",
    author: "Ravi Sharma",
    date: "Oct 12, 2023",
    category: "Care Guide"
  },
  {
    id: 2,
    title: "Wooden decor transformation ideas",
    excerpt: "Discover how adding natural wood elements can instantly warm up a sterile modern space and create a cozy, inviting atmosphere.",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop",
    author: "Priya Patel",
    date: "Nov 05, 2023",
    category: "Home Decor"
  },
  {
    id: 3,
    title: "Why wooden gifts are thoughtful",
    excerpt: "Explore the psychological and emotional reasons why receiving a handcrafted wooden item feels more special than mass-produced alternatives.",
    image: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=2070&auto=format&fit=crop",
    author: "Amit Kumar",
    date: "Dec 01, 2023",
    category: "Gifting"
  },
  {
    id: 4,
    title: "Teak vs Mango wood comparison",
    excerpt: "An in-depth look at the differences in grain, durability, sustainability, and best uses for these two popular hardwood choices.",
    image: "https://images.unsplash.com/photo-1593006526979-4f8f5c6dd6b1?q=80&w=2070&auto=format&fit=crop",
    author: "Neha Singh",
    date: "Jan 15, 2024",
    category: "Materials"
  },
  {
    id: 5,
    title: "Food-safe wood finishes explained",
    excerpt: "Demystifying the world of wood finishes. What makes a finish truly food-safe, and why we choose natural oils over synthetic lacquers.",
    image: "https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=2070&auto=format&fit=crop",
    author: "Vikram Desai",
    date: "Feb 28, 2024",
    category: "Manufacturing"
  }
];

export function Blog() {
  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="hofo-eyebrow">Editorial</p>
              <h1 className="mt-2 font-serif text-4xl leading-[0.92] text-hofo-walnut-dark md:text-6xl">The HOFO Journal</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Stories from our workshop, practical care guides, and design inspiration for living with handcrafted wood.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-full border border-hofo-walnut/14 bg-white/80 px-4 py-2.5 shadow-sm">
              <label htmlFor="blog-search" className="sr-only">Search journal</label>
              <div className="flex items-center gap-2 text-hofo-walnut/60">
                <Search className="h-4 w-4" />
                <input
                  id="blog-search"
                  type="text"
                  placeholder="Search stories"
                  className="w-full bg-transparent text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Care Guide",
              "Materials",
              "Home Decor",
              "Gifting",
              "Manufacturing",
            ].map((tag) => (
              <button
                key={tag}
                className="rounded-full border border-hofo-walnut/15 bg-white/76 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut/70 hover:border-hofo-teak/45 hover:text-hofo-teak"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-10">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="group overflow-hidden rounded-[30px] border border-hofo-walnut/10 bg-white/84 shadow-[0_20px_38px_rgba(30,17,9,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="relative overflow-hidden">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent lg:hidden" />
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-hofo-teak">
                <span>{articles[0].category}</span>
                <span className="w-1 h-1 rounded-full bg-hofo-walnut/30" />
                <span className="flex items-center gap-1 text-hofo-walnut/50">
                  <Calendar className="h-3.5 w-3.5" />
                  {articles[0].date}
                </span>
              </div>

              <h2 className="mt-4 font-serif text-4xl leading-[0.96] text-hofo-walnut-dark transition-colors group-hover:text-hofo-teak md:text-5xl">
                {articles[0].title}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-hofo-walnut/72 md:text-lg">
                {articles[0].excerpt}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hofo-walnut/10 pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-hofo-beige">
                    <img src="https://i.pravatar.cc/150?img=11" alt={articles[0].author} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-semibold text-hofo-walnut-dark">{articles[0].author}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button className="text-hofo-walnut/50 hover:text-hofo-teak transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <Link
                    to={`/blog/${articles[0].id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-teak hover:text-hofo-walnut-dark"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      </section>

      <section className="section-shell mt-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {articles.slice(1).map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-[26px] border border-hofo-walnut/10 bg-white/82 shadow-[0_14px_28px_rgba(27,14,8,0.08)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-hofo-teak">
                  {article.category}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-1 text-xs text-hofo-walnut/50">
                  <Calendar className="h-3 w-3" />
                  {article.date}
                </div>

                <h3 className="line-clamp-2 font-serif text-2xl leading-tight text-hofo-walnut-dark transition-colors group-hover:text-hofo-teak">
                  {article.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-hofo-walnut/72">
                  {article.excerpt}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-hofo-walnut/10 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/65">
                    <User className="h-3 w-3 text-hofo-teak" />
                    {article.author}
                  </div>

                  <Link to={`/blog/${article.id}`} className="text-hofo-teak hover:text-hofo-walnut-dark">
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
