import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Hammer,
  Leaf,
  MessageCircle,
  ShoppingCart,
  ShieldCheck,
  Star,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { addToCart } from "@/lib/cart";
import { getFallbackProductById, getProductById } from "@/lib/api";

const ZOOM_SCALE = 2;
const LENS_BASE_SIZE = 170;
const ZOOM_PANEL_SIZE = 500;

const defaultProduct = getFallbackProductById("fallback-1");

export function ProductDetail() {
  const { id } = useParams();
  const productId = id ? String(id) : defaultProduct.id;
  const [product, setProduct] = useState(defaultProduct);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(defaultProduct.variants.size[0]);
  const [selectedFinish, setSelectedFinish] = useState(product.variants.finish[0]);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const imageFrameRef = useRef(null);
  const lensRef = useRef(null);
  const zoomPanelRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setProductError("");

      try {
        const item = await getProductById(productId);
        if (!cancelled) {
          setProduct(item);
        }
      } catch {
        if (!cancelled) {
          setProduct(getFallbackProductById(productId));
          setProductError("Unable to reach backend. Showing sample wooden product.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    setActiveImage(0);
    setSelectedSize(product.variants.size[0]);
    setSelectedFinish(product.variants.finish[0]);
    setActiveFaq(0);
    setAddedToCart(false);
  }, [product.id]);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncInputMode = () => setIsHoverDevice(media.matches);

    syncInputMode();

    if (media.addEventListener) {
      media.addEventListener("change", syncInputMode);
    } else {
      media.addListener(syncInputMode);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", syncInputMode);
      } else {
        media.removeListener(syncInputMode);
      }
    };
  }, []);

  const updateMagnifierPosition = () => {
    rafRef.current = null;

    const frame = imageFrameRef.current;
    const lens = lensRef.current;
    const zoomPanel = zoomPanelRef.current;

    if (!frame || !lens || !zoomPanel) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    const lensSize = Math.min(LENS_BASE_SIZE, rect.width * 0.5, rect.height * 0.5);
    const lensHalf = lensSize / 2;

    const pointerX = pointerRef.current.x - rect.left;
    const pointerY = pointerRef.current.y - rect.top;

    const x = Math.min(Math.max(pointerX, lensHalf), rect.width - lensHalf);
    const y = Math.min(Math.max(pointerY, lensHalf), rect.height - lensHalf);

    lens.style.width = `${lensSize}px`;
    lens.style.height = `${lensSize}px`;
    lens.style.transform = `translate3d(${x - lensHalf}px, ${y - lensHalf}px, 0)`;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    zoomPanel.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
  };

  const requestMagnifierFrame = () => {
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(updateMagnifierPosition);
  };

  const handlePointerEnter = (event) => {
    if (!isHoverDevice) {
      return;
    }

    pointerRef.current = { x: event.clientX, y: event.clientY };
    setIsMagnifierActive(true);
    requestMagnifierFrame();
  };

  const handlePointerMove = (event) => {
    if (!isHoverDevice || !isMagnifierActive) {
      return;
    }

    pointerRef.current = { x: event.clientX, y: event.clientY };
    requestMagnifierFrame();
  };

  const handlePointerLeave = () => {
    setIsMagnifierActive(false);

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    if (!isMagnifierActive || !isHoverDevice) {
      return;
    }

    requestMagnifierFrame();
  }, [isMagnifierActive, isHoverDevice, activeImage]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const activeImageUrl = product.images[activeImage] || product.images[0];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });

    setAddedToCart(true);

    window.setTimeout(() => {
      setAddedToCart(false);
    }, 1100);
  };

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell mb-8">
        <div className="rounded-2xl border border-hofo-walnut/10 bg-white/75 px-4 py-3 text-sm text-hofo-walnut/65 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
            <Link to="/" className="hover:text-hofo-teak">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-hofo-teak">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-hofo-walnut-dark">{product.name}</span>
          </div>
        </div>
      </section>

      {(productError || isLoadingProduct) && (
        <section className="section-shell mb-8">
          <div className="rounded-2xl border border-hofo-walnut/10 bg-white/75 px-4 py-3 text-sm text-hofo-walnut/65 shadow-sm">
            {isLoadingProduct ? "Loading product details from backend..." : productError}
          </div>
        </section>
      )}

      <section className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] xl:gap-14">
          <div className="space-y-4 lg:sticky lg:top-28 lg:h-max">
            <div className="relative">
              <div
                ref={imageFrameRef}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-[30px] border border-hofo-walnut/10 bg-hofo-beige/65",
                  isHoverDevice && "cursor-crosshair"
                )}
                onPointerEnter={handlePointerEnter}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              >
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-300 ease-out",
                    isMagnifierActive ? "scale-[1.06]" : "scale-100"
                  )}
                />

                <AnimatePresence>
                  {isHoverDevice && isMagnifierActive && (
                    <motion.div
                      ref={lensRef}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="pointer-events-none absolute left-0 top-0 z-20 rounded-2xl border border-white/75 bg-white/20 shadow-[0_12px_28px_rgba(20,12,7,0.22)] backdrop-blur-[1px]"
                      style={{ willChange: "transform" }}
                    />
                  )}
                </AnimatePresence>

                <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-hofo-teak">
                  {product.discount}% Off
                </div>

                <div
                  className={cn(
                    "pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-200",
                    isHoverDevice && !isMagnifierActive ? "opacity-100" : "opacity-0"
                  )}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Hover To Zoom
                </div>
              </div>

              <AnimatePresence>
                {isHoverDevice && isMagnifierActive && (
                  <motion.div
                    ref={zoomPanelRef}
                    initial={{ opacity: 0, x: 12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="pointer-events-none z-30 mt-4 hidden overflow-hidden rounded-[26px] border border-hofo-walnut/12 bg-hofo-cream shadow-[0_24px_44px_rgba(18,10,6,0.2)] md:block xl:absolute xl:left-[calc(100%+1.15rem)] xl:top-0 xl:mt-0"
                    style={{
                      width: `${ZOOM_PANEL_SIZE}px`,
                      height: `${ZOOM_PANEL_SIZE}px`,
                      backgroundImage: `url(${activeImageUrl})`,
                      backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "50% 50%",
                      willChange: "background-position",
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 border-b border-hofo-walnut/10 bg-white/65 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-hofo-walnut/72">
                      2 x Zoom Preview
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "overflow-hidden rounded-xl border-2 transition-all",
                    activeImage === idx ? "border-hofo-teak opacity-100" : "border-transparent opacity-65 hover:opacity-100"
                  )}
                  aria-label={`Preview image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="aspect-square h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="hofo-eyebrow">Handcrafted Essential</p>

            <h1 className="mt-2 font-serif text-4xl leading-[0.95] text-hofo-walnut-dark md:text-6xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-hofo-walnut/55">(128 reviews)</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="font-serif text-5xl leading-none text-hofo-walnut-dark">Rs.{product.price}</span>
              <span className="pb-1 text-lg text-hofo-walnut/35 line-through">Rs.{product.mrp}</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Save Rs.{product.mrp - product.price}
              </span>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-hofo-walnut/78 md:text-base">
              {product.desc}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-hofo-walnut/65">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]",
                        selectedSize === size
                          ? "border-hofo-walnut-dark bg-hofo-walnut-dark text-hofo-cream"
                          : "border-hofo-walnut/15 bg-white text-hofo-walnut/75 hover:border-hofo-walnut/35"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-hofo-walnut/65">Finish</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.finish.map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]",
                        selectedFinish === finish
                          ? "border-hofo-walnut-dark bg-hofo-walnut-dark text-hofo-cream"
                          : "border-hofo-walnut/15 bg-white text-hofo-walnut/75 hover:border-hofo-walnut/35"
                      )}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-xs font-semibold uppercase tracking-[0.16em]",
                  addedToCart
                    ? "bg-hofo-teak text-white"
                    : "bg-hofo-walnut-dark text-hofo-cream hover:bg-hofo-teak"
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                {addedToCart ? "Added To Cart" : "Add To Cart"}
              </button>

              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#1fae52]">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Chat
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 rounded-3xl border border-hofo-walnut/10 bg-white/70 p-4 sm:grid-cols-4">
              {[
                { icon: ShieldCheck, label: "Food Safe" },
                { icon: Hammer, label: "Handmade" },
                { icon: Leaf, label: "Eco Timber" },
                { icon: CheckCircle2, label: "Quality Tested" },
              ].map((badge) => (
                <div key={badge.label} className="rounded-2xl border border-hofo-walnut/8 bg-white/70 p-3 text-center">
                  <badge.icon className="mx-auto h-5 w-5 text-hofo-teak" strokeWidth={1.5} />
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/65">{badge.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl leading-none text-hofo-walnut-dark">Specifications</h3>
              <div className="mt-4 overflow-hidden rounded-3xl border border-hofo-walnut/10 bg-white/80">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={cn(
                      "grid gap-1 p-4 text-sm sm:grid-cols-[0.36fr_1fr]",
                      i % 2 === 1 && "bg-hofo-beige/25",
                      i !== Object.entries(product.specs).length - 1 && "border-b border-hofo-walnut/8"
                    )}
                  >
                    <p className="font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">{key}</p>
                    <p className="text-hofo-walnut-dark">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-serif text-3xl leading-none text-hofo-walnut-dark">Frequently Asked Questions</h3>
              <div className="mt-4 space-y-3">
                {product.faqs.map((faq, i) => (
                  <article key={faq.q} className="overflow-hidden rounded-2xl border border-hofo-walnut/10 bg-white/82">
                    <button
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    >
                      <span className="text-sm font-semibold text-hofo-walnut-dark sm:text-base">{faq.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-hofo-teak transition-transform",
                          activeFaq === i && "rotate-180"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <p className="border-t border-hofo-walnut/8 px-5 pb-5 pt-3 text-sm leading-relaxed text-hofo-walnut/74">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
