import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  AlertCircle,
  ChevronDown,
  Filter,
  Grid,
  Heart,
  List,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { addToCart } from "@/lib/cart";
import { getFallbackProducts, getProducts } from "@/lib/api";
import { premiumWoodenImage } from "@/lib/defaultProducts";

const filterBlocks = [
  {
    title: "Category",
    values: ["Decor", "Kitchenware", "Gift Sets", "Custom"],
  },
  {
    title: "Wood Type",
    values: ["Teak", "Mango", "Sheesham", "Bamboo", "Acacia"],
  },
  {
    title: "Finish",
    values: ["Natural", "Smoked", "Polished", "Matte Oil"],
  },
];

function FilterPanel() {
  return (
    <div className="space-y-8">
      {filterBlocks.map((block) => (
        <div key={block.title}>
          <h3 className="mb-4 border-b border-hofo-walnut/10 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut-dark">
            {block.title}
          </h3>
          <ul className="space-y-3 text-sm text-hofo-walnut/80">
            {block.values.map((value) => {
              const optionId = `${block.title.toLowerCase().replace(/\s+/g, "-")}-${value
                .toLowerCase()
                .replace(/\s+/g, "-")}`;

              return (
                <li key={value}>
                  <label
                    htmlFor={optionId}
                    className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-hofo-walnut/10 bg-white/72 px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-hofo-teak/40 hover:bg-hofo-beige/30"
                  >
                    <input id={optionId} type="checkbox" className="peer sr-only" />

                    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-hofo-walnut/30 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all peer-checked:border-hofo-teak peer-checked:bg-hofo-teak peer-focus-visible:ring-2 peer-focus-visible:ring-hofo-teak/35 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white">
                      <span className="h-2.5 w-[5px] rotate-45 border-b-2 border-r-2 border-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100" />
                    </span>

                    <span className="font-medium tracking-[0.01em] text-hofo-walnut/80 transition-colors group-hover:text-hofo-walnut-dark peer-checked:text-hofo-walnut-dark">
                      {value}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div>
        <h3 className="mb-4 border-b border-hofo-walnut/10 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut-dark">
          Budget
        </h3>
        <input type="range" className="w-full accent-hofo-teak" min="0" max="12000" />
        <div className="mt-2 flex justify-between text-xs text-hofo-walnut/55">
          <span>Rs.0</span>
          <span>Rs.12,000+</span>
        </div>
      </div>
    </div>
  );
}

function getProductCoverImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  const primaryImage = images.find((image) => typeof image === "string" && image.trim());
  return primaryImage || premiumWoodenImage;
}

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState("");
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const searchParamValue = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(searchParamValue);

  useEffect(() => {
    setSearchInput(searchParamValue);
  }, [searchParamValue]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError("");

      try {
        const items = await getProducts(searchParamValue);
        if (!cancelled) {
          setCatalogProducts(items);
        }
      } catch {
        if (!cancelled) {
          setProductsError("Could not reach backend API. Showing sample wooden catalog.");
          setCatalogProducts(getFallbackProducts(searchParamValue));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [searchParamValue]);

  const filteredProducts = catalogProducts;

  const handleCatalogSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    const value = searchInput.trim();

    if (value) {
      next.set("search", value);
    } else {
      next.delete("search");
    }

    setSearchParams(next, { replace: true });
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const handleAddToCart = (product) => {
    const coverImage = getProductCoverImage(product);

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: coverImage,
      quantity: 1,
    });

    setLastAddedProductId(product.id);

    window.setTimeout(() => {
      setLastAddedProductId((current) => (current === product.id ? "" : current));
    }, 1000);
  };

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="hofo-eyebrow">Catalog</p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">Our Collection</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Explore handcrafted wooden pieces where utility meets sculptural detail. Filter by material, function, and finish to find your next heirloom object.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-hofo-walnut-dark">
              <form
                onSubmit={handleCatalogSearch}
                className="flex w-full items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/75 px-3 py-2 sm:w-auto"
              >
                <Search className="h-4 w-4 text-hofo-walnut/55" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search products"
                  className="w-full bg-transparent text-xs text-hofo-walnut-dark outline-none placeholder:text-hofo-walnut/45 sm:w-40"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center rounded-full bg-hofo-walnut-dark px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-hofo-cream hover:bg-hofo-teak"
                >
                  Go
                </button>
              </form>

              <span className="hidden rounded-full border border-hofo-walnut/15 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.14em] text-hofo-walnut/65 md:inline-flex">
                Showing {filteredProducts.length} Result{filteredProducts.length === 1 ? "" : "s"}
              </span>

              <button
                className="inline-flex items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] md:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <button className="inline-flex items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                Recommended
                <ChevronDown className="h-4 w-4" />
              </button>

              <div className="hidden items-center gap-1 rounded-full border border-hofo-walnut/15 bg-white/75 p-1 md:flex">
                <button
                  onClick={() => setView('grid')}
                  className={cn(
                    "rounded-full p-2",
                    view === 'grid' ? "bg-hofo-walnut-dark text-hofo-cream" : "text-hofo-walnut/65 hover:bg-hofo-beige/60"
                  )}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn(
                    "rounded-full p-2",
                    view === 'list' ? "bg-hofo-walnut-dark text-hofo-cream" : "text-hofo-walnut/65 hover:bg-hofo-beige/60"
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 flex gap-8">
        <aside className="sticky top-28 hidden h-max w-72 shrink-0 rounded-3xl border border-hofo-walnut/10 bg-white/70 p-6 shadow-[0_20px_35px_rgba(30,17,9,0.08)] md:block">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut-dark">Refine</p>
            <SlidersHorizontal className="h-4 w-4 text-hofo-walnut/60" />
          </div>
          <FilterPanel />
        </aside>

        <div className="flex-1">
          <div className="mb-7 flex flex-wrap items-center gap-2">
            {productsError && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-medium text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" />
                {productsError}
              </span>
            )}

            {searchParamValue && (
              <span className="inline-flex items-center gap-2 rounded-full border border-hofo-walnut/12 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-hofo-walnut-dark">
                Search: "{searchParamValue}"
                <button
                  onClick={clearSearch}
                  className="text-hofo-walnut/45 hover:text-red-500"
                  type="button"
                >
                  &times;
                </button>
              </span>
            )}

            <span className="inline-flex items-center gap-2 rounded-full border border-hofo-walnut/12 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-hofo-walnut-dark">
              Teak Wood
              <button className="text-hofo-walnut/45 hover:text-red-500">&times;</button>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-hofo-walnut/12 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-hofo-walnut-dark">
              Kitchenware
              <button className="text-hofo-walnut/45 hover:text-red-500">&times;</button>
            </span>
            <button className="text-xs font-semibold uppercase tracking-[0.12em] text-hofo-teak hover:text-hofo-walnut-dark">
              Clear Filters
            </button>
          </div>

          <div
            className={cn(
              "grid gap-6",
              view === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            {isLoadingProducts ? (
              <div className="col-span-full rounded-3xl border border-hofo-walnut/12 bg-white/80 p-8 text-center">
                <p className="font-serif text-3xl text-hofo-walnut-dark">Loading collection...</p>
                <p className="mt-3 text-sm text-hofo-walnut/70">
                  Fetching wooden products from backend.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-hofo-walnut/12 bg-white/80 p-8 text-center">
                <p className="font-serif text-3xl text-hofo-walnut-dark">No products found</p>
                <p className="mt-3 text-sm text-hofo-walnut/70">
                  No matches for "{searchParamValue}". Try another keyword.
                </p>
                <button
                  onClick={clearSearch}
                  type="button"
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-hofo-walnut-dark px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark hover:bg-hofo-walnut-dark hover:text-hofo-cream"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredProducts.map((product, i) => {
                const coverImage = getProductCoverImage(product);

                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: i * 0.04, duration: 0.45 }}
                    className={cn(
                      "group overflow-hidden rounded-[28px] border border-hofo-walnut/10 bg-white/80 shadow-[0_14px_28px_rgba(28,16,8,0.08)]",
                      view === 'list' && "flex flex-col gap-5 p-4 sm:flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden bg-hofo-beige",
                        view === 'grid' ? "aspect-square" : "aspect-square w-full rounded-2xl sm:w-64 sm:shrink-0"
                      )}
                    >
                      <img
                        src={coverImage}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = premiumWoodenImage;
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-hofo-teak">
                        {product.discount}% Off
                      </div>

                      <div className="absolute right-4 top-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-hofo-walnut-dark shadow-sm hover:text-red-500">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex flex-col",
                        view === 'grid' ? "p-5" : "flex-1 justify-center py-2 pr-4"
                      )}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-hofo-walnut/55">
                        {product.category} • {product.wood}
                      </p>

                      <Link to={`/products/${product.id}`}>
                        <h3 className="mt-2 font-serif text-2xl leading-tight text-hofo-walnut-dark group-hover:text-hofo-teak">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-3 text-sm leading-relaxed text-hofo-walnut/72">
                        {product.desc} {product.story}
                      </p>

                      <div className="mt-4 flex items-end gap-3">
                        <span className="text-2xl font-semibold text-hofo-walnut-dark">Rs.{product.price}</span>
                        <span className="pb-0.5 text-sm text-hofo-walnut/42 line-through">Rs.{product.mrp}</span>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <Link
                          to={`/products/${product.id}`}
                          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-hofo-walnut-dark px-4 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak"
                        >
                          View Details
                        </Link>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full border text-hofo-walnut-dark",
                            lastAddedProductId === product.id
                              ? "border-hofo-teak bg-hofo-teak text-white"
                              : "border-hofo-walnut/18 hover:bg-hofo-beige/60"
                          )}
                          type="button"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>

          <div className="mt-14 text-center">
            <button className="inline-flex h-12 items-center justify-center rounded-full border border-hofo-walnut-dark px-7 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut-dark hover:bg-hofo-walnut-dark hover:text-hofo-cream">
              Load More Products
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-hofo-walnut-dark/55 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-[28px] border-t border-hofo-walnut/12 bg-hofo-cream p-6 md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut-dark">Filter Products</p>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hofo-walnut/18"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <FilterPanel />

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-hofo-walnut-dark text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream"
              >
                Apply Filters
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
