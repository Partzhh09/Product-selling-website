import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Copy,
  Filter,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminLogin,
  clearStoredAdminToken,
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getProducts,
  getStoredAdminToken,
  setStoredAdminToken,
  updateAdminProduct
} from "@/lib/api";
import { premiumWoodenImage } from "@/lib/defaultProducts";

const FAQ_SEPARATOR = "::";

const emptyFormState = {
  name: "",
  desc: "",
  category: "Kitchenware",
  wood: "Teak",
  story: "",
  price: "",
  mrp: "",
  discount: "",
  imageUrl: premiumWoodenImage,
  sizes: "Standard",
  finishes: "Natural Oil",
  specsText: "Material: Solid Teak Wood\nFinish: Food-safe Mineral Oil",
  faqsText: "How do I clean this product? :: Wipe with a damp cloth and dry immediately."
};

function parseList(rawValue) {
  return String(rawValue || "")
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseSpecsText(rawSpecs) {
  const specs = {};

  String(rawSpecs || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key && value) {
        specs[key] = value;
      }
    });

  return specs;
}

function parseFaqsText(rawFaqs) {
  return String(rawFaqs || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(FAQ_SEPARATOR);

      if (separatorIndex === -1) {
        return null;
      }

      const question = line.slice(0, separatorIndex).trim();
      const answer = line.slice(separatorIndex + FAQ_SEPARATOR.length).trim();

      if (!question || !answer) {
        return null;
      }

      return { q: question, a: answer };
    })
    .filter(Boolean);
}

function formatSpecsText(specs) {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return "";
  }

  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${String(value ?? "").trim()}`)
    .filter((line) => line !== ":")
    .join("\n");
}

function formatFaqsText(faqs) {
  if (!Array.isArray(faqs)) {
    return "";
  }

  return faqs
    .map((faq) => {
      const question = typeof faq?.q === "string" ? faq.q.trim() : "";
      const answer = typeof faq?.a === "string" ? faq.a.trim() : "";

      if (!question || !answer) {
        return "";
      }

      return `${question} ${FAQ_SEPARATOR} ${answer}`;
    })
    .filter(Boolean)
    .join("\n");
}

function toFormState(product) {
  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [premiumWoodenImage];

  const sizeOptions = Array.isArray(product?.variants?.size) ? product.variants.size : ["Standard"];
  const finishOptions = Array.isArray(product?.variants?.finish)
    ? product.variants.finish
    : ["Natural Oil"];

  return {
    name: String(product?.name || ""),
    desc: String(product?.desc || ""),
    category: String(product?.category || "Kitchenware"),
    wood: String(product?.wood || "Teak"),
    story: String(product?.story || ""),
    price: product?.price != null ? String(product.price) : "",
    mrp: product?.mrp != null ? String(product.mrp) : "",
    discount: product?.discount != null ? String(product.discount) : "",
    imageUrl: images.join("\n"),
    sizes: sizeOptions.join(", "),
    finishes: finishOptions.join(", "),
    specsText: formatSpecsText(product?.specs),
    faqsText: formatFaqsText(product?.faqs)
  };
}

function toPayload(form) {
  const price = Number(form.price);
  const mrp = Number(form.mrp);
  const discount = Number(form.discount);

  const payload = {
    name: form.name.trim(),
    desc: form.desc.trim(),
    category: form.category.trim() || "Kitchenware",
    wood: form.wood.trim() || "Teak",
    story: form.story.trim(),
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    mrp: Number.isFinite(mrp) ? Math.max(0, Math.round(mrp)) : 0,
    images: parseList(form.imageUrl),
    variants: {
      size: parseList(form.sizes),
      finish: parseList(form.finishes)
    },
    specs: parseSpecsText(form.specsText),
    faqs: parseFaqsText(form.faqsText)
  };

  if (Number.isFinite(discount) && discount >= 0) {
    payload.discount = Math.round(discount);
  }

  return payload;
}

function formatDateTime(value) {
  const date = new Date(value || 0);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function AdminPanel() {
  const [adminSecret, setAdminSecret] = useState("");
  const [token, setToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyFormState);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(
        products
          .map((item) => String(item.category || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...categories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const list = products.filter((product) => {
      if (categoryFilter !== "All" && product.category !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [product.name, product.desc, product.category, product.wood, product.story]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    const sorted = [...list];

    sorted.sort((a, b) => {
      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "discount-high") {
        return Number(b.discount || 0) - Number(a.discount || 0);
      }

      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return sorted;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    const categoryCount = new Set(products.map((item) => item.category).filter(Boolean)).size;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((item) => ["placed", "confirmed"].includes(String(item?.status || ""))).length;
    const orderRevenue = orders.reduce((sum, item) => sum + Number(item?.pricing?.total || 0), 0);
    const avgPrice = totalProducts
      ? Math.round(products.reduce((sum, item) => sum + Number(item.price || 0), 0) / totalProducts)
      : 0;
    const avgDiscount = totalProducts
      ? Math.round(products.reduce((sum, item) => sum + Number(item.discount || 0), 0) / totalProducts)
      : 0;

    return {
      totalProducts,
      categoryCount,
      totalOrders,
      pendingOrders,
      orderRevenue,
      avgPrice,
      avgDiscount
    };
  }, [products, orders]);

  const previewImage = useMemo(() => {
    const images = parseList(form.imageUrl);
    return images[0] || premiumWoodenImage;
  }, [form.imageUrl]);

  const loadProducts = async (withLoader = true) => {
    if (!token) {
      return;
    }

    if (withLoader) {
      setLoadingProducts(true);
    }

    setErrorMessage("");

    try {
      const nextProducts = await getProducts();
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      if (withLoader) {
        setLoadingProducts(false);
      }
    }
  };

  const loadOrders = async (withLoader = true) => {
    if (!token) {
      return;
    }

    if (withLoader) {
      setLoadingOrders(true);
    }

    try {
      const nextOrders = await getAdminOrders(token);
      setOrders(nextOrders);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load orders.");
    } finally {
      if (withLoader) {
        setLoadingOrders(false);
      }
    }
  };

  useEffect(() => {
    const savedToken = getStoredAdminToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadProducts();
    loadOrders();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!adminSecret.trim()) {
      setErrorMessage("Enter your admin password to continue.");
      return;
    }

    try {
      const nextToken = await adminLogin(adminSecret.trim());
      setStoredAdminToken(nextToken);
      setToken(nextToken);
      setAdminSecret("");
      setStatusMessage("Admin session started.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Admin login failed.");
    }
  };

  const handleLogout = () => {
    clearStoredAdminToken();
    setToken("");
    setEditingId("");
    setProducts([]);
    setOrders([]);
    setForm(emptyFormState);
    setSearchTerm("");
    setCategoryFilter("All");
    setSortBy("newest");
    setStatusMessage("Admin session ended.");
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(emptyFormState);
  };

  const handleStartEdit = (product) => {
    setEditingId(product.id);
    setForm(toFormState(product));
    setStatusMessage(`Editing ${product.name}`);
    setErrorMessage("");
  };

  const handleDuplicate = (product) => {
    const nextForm = toFormState(product);
    nextForm.name = `${nextForm.name} Copy`;
    setEditingId("");
    setForm(nextForm);
    setStatusMessage(`Duplicating ${product.name}`);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    const payload = toPayload(form);

    if (!payload.name) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!payload.images.length) {
      setErrorMessage("At least one image URL is required.");
      return;
    }

    if (payload.price <= 0 || payload.mrp <= 0) {
      setErrorMessage("Price and MRP should be greater than 0.");
      return;
    }

    if (payload.mrp < payload.price) {
      payload.mrp = payload.price;
    }

    setSavingProduct(true);

    try {
      if (editingId) {
        await updateAdminProduct(editingId, payload, token);
        setStatusMessage("Product updated.");
      } else {
        await createAdminProduct(payload, token);
        setStatusMessage("Product created.");
      }

      resetForm();
      await loadProducts(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const confirmed = window.confirm(`Delete ${productName}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setDeletingProductId(productId);

    try {
      await deleteAdminProduct(productId, token);
      setProducts((current) => current.filter((item) => item.id !== productId));
      if (editingId === productId) {
        resetForm();
      }
      setStatusMessage("Product deleted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete product.");
    } finally {
      setDeletingProductId("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setSortBy("newest");
  };

  if (!token) {
    return (
      <div className="pb-24 pt-8">
        <section className="section-shell">
          <div className="mx-auto max-w-xl grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
            <p className="hofo-eyebrow">Admin Access</p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-5xl">
              Sign in to Admin Panel
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-hofo-walnut/72">
              Use your configured admin password to access full product controls.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Admin Password
                </span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                  <input
                    value={adminSecret}
                    onChange={(event) => setAdminSecret(event.target.value)}
                    placeholder="Enter admin password"
                    className="h-12 w-full rounded-2xl border border-hofo-walnut/15 bg-white pl-11 pr-4 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                  />
                </div>
              </label>

              {errorMessage && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.16em] text-hofo-cream hover:bg-hofo-teak"
              >
                Open Admin Panel
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="grain-card rounded-[30px] p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="hofo-eyebrow">Admin Dashboard</p>
              <h1 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">
                Catalog & Order Control
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Manage product data and monitor real-time customer orders in one control room.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loadProducts();
                  loadOrders();
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </button>

              <Link
                to="/products"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              >
                <Shield className="h-3.5 w-3.5" />
                View Storefront
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Total Products</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{dashboardStats.totalProducts}</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Categories</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{dashboardStats.categoryCount}</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Avg Price</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">Rs.{dashboardStats.avgPrice.toLocaleString("en-IN")}</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Avg Discount</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{dashboardStats.avgDiscount}%</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Total Orders</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{dashboardStats.totalOrders}</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Pending Orders</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">{dashboardStats.pendingOrders}</p>
        </article>

        <article className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_12px_30px_rgba(30,18,10,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">Order Revenue</p>
          <p className="mt-2 font-serif text-4xl text-hofo-walnut-dark">
            Rs.{dashboardStats.orderRevenue.toLocaleString("en-IN")}
          </p>
        </article>
      </section>

      <section className="section-shell mt-10 grid gap-8 xl:grid-cols-[430px_1fr]">
        <aside className="h-max rounded-3xl border border-hofo-walnut/10 bg-white/82 p-6 shadow-[0_18px_35px_rgba(30,18,10,0.1)] xl:sticky xl:top-28">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">
              {editingId ? "Edit Product" : "Create Product"}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hofo-walnut/16 text-hofo-walnut/60 hover:text-hofo-walnut-dark"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                Product Name
              </span>
              <input
                value={form.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="Premium Wooden Bowl"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                Description
              </span>
              <textarea
                value={form.desc}
                onChange={(event) => handleFieldChange("desc", event.target.value)}
                className="min-h-20 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="Handcrafted from solid teak..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Category
                </span>
                <input
                  value={form.category}
                  onChange={(event) => handleFieldChange("category", event.target.value)}
                  className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Wood Type
                </span>
                <input
                  value={form.wood}
                  onChange={(event) => handleFieldChange("wood", event.target.value)}
                  className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Price
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => handleFieldChange("price", event.target.value)}
                  className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  MRP
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.mrp}
                  onChange={(event) => handleFieldChange("mrp", event.target.value)}
                  className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Discount %
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.discount}
                  onChange={(event) => handleFieldChange("discount", event.target.value)}
                  className="h-11 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                Story
              </span>
              <textarea
                value={form.story}
                onChange={(event) => handleFieldChange("story", event.target.value)}
                className="min-h-16 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="Short artisan story"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                Image URLs
              </span>
              <textarea
                value={form.imageUrl}
                onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
                className="min-h-24 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-xs text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="One URL per line or comma separated"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Sizes
                </span>
                <textarea
                  value={form.sizes}
                  onChange={(event) => handleFieldChange("sizes", event.target.value)}
                  className="min-h-16 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-xs text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                  placeholder="Small, Medium, Large"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                  Finishes
                </span>
                <textarea
                  value={form.finishes}
                  onChange={(event) => handleFieldChange("finishes", event.target.value)}
                  className="min-h-16 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-xs text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                  placeholder="Natural Oil, Matte"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                Specs (one per line)
              </span>
              <textarea
                value={form.specsText}
                onChange={(event) => handleFieldChange("specsText", event.target.value)}
                className="min-h-20 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-xs text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="Material: Solid Teak Wood"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/58">
                FAQs (Question :: Answer)
              </span>
              <textarea
                value={form.faqsText}
                onChange={(event) => handleFieldChange("faqsText", event.target.value)}
                className="min-h-20 w-full rounded-xl border border-hofo-walnut/15 bg-white px-3 py-2 text-xs text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                placeholder="Is this food safe? :: Yes, finished with food-safe oils."
              />
            </label>

            <button
              type="submit"
              disabled={savingProduct}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {savingProduct ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hofo-walnut/18 bg-white px-6 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              >
                <X className="h-4 w-4" />
                Switch to Create Mode
              </button>
            )}
          </form>

          <article className="mt-6 overflow-hidden rounded-2xl border border-hofo-walnut/12 bg-white/92">
            <img src={previewImage} alt="Live product preview" className="aspect-[5/3] w-full object-cover" />
            <div className="space-y-1 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-hofo-walnut/58">
                Live Preview
              </p>
              <h3 className="font-serif text-2xl text-hofo-walnut-dark">{form.name || "Product name"}</h3>
              <p className="text-xs uppercase tracking-[0.12em] text-hofo-walnut/58">
                {(form.category || "Category").trim()} | {(form.wood || "Wood").trim()}
              </p>
              <p className="text-sm font-semibold text-hofo-walnut-dark">
                Rs.{Number(form.price || 0).toLocaleString("en-IN")} | MRP Rs.{Number(form.mrp || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </article>
        </aside>

        <div className="space-y-4">
          {statusMessage && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-4 shadow-[0_12px_30px_rgba(30,18,10,0.07)] md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block w-full sm:max-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products"
                    className="h-10 w-full rounded-xl border border-hofo-walnut/15 bg-white pl-9 pr-3 text-sm text-hofo-walnut-dark placeholder:text-hofo-walnut/35 focus:border-hofo-teak focus:outline-none"
                  />
                </label>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-10 rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 rounded-xl border border-hofo-walnut/15 bg-white px-3 text-sm text-hofo-walnut-dark focus:border-hofo-teak focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount-high">Discount: High to Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 items-center rounded-full border border-hofo-walnut/12 bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut/65">
                  {filteredProducts.length} Item{filteredProducts.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 items-center gap-1 rounded-full border border-hofo-walnut/15 bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loadingProducts ? (
            <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
              No products match your filters. Try a broader search.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => {
                const specsCount = product?.specs && typeof product.specs === "object"
                  ? Object.keys(product.specs).length
                  : 0;
                const faqCount = Array.isArray(product?.faqs) ? product.faqs.length : 0;

                return (
                  <article
                    key={product.id}
                    className={cn(
                      "overflow-hidden rounded-3xl border border-hofo-walnut/10 bg-white/82 shadow-[0_14px_28px_rgba(28,16,8,0.08)]",
                      editingId === product.id && "ring-2 ring-hofo-teak/35"
                    )}
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                      <img
                        src={product.images?.[0] || premiumWoodenImage}
                        alt={product.name}
                        className="h-24 w-full rounded-2xl object-cover sm:w-28"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">
                          {product.category} | {product.wood}
                        </p>
                        <h3 className="mt-1 truncate font-serif text-2xl text-hofo-walnut-dark">{product.name}</h3>
                        <p className="mt-1 text-sm text-hofo-walnut/70">{product.desc}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-hofo-walnut/12 bg-white px-2.5 py-1 text-[11px] font-medium text-hofo-walnut/72">
                            Rs.{Number(product.price || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-full border border-hofo-walnut/12 bg-white px-2.5 py-1 text-[11px] font-medium text-hofo-walnut/72">
                            MRP Rs.{Number(product.mrp || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-full border border-hofo-walnut/12 bg-white px-2.5 py-1 text-[11px] font-medium text-hofo-walnut/72">
                            {Number(product.discount || 0)}% Off
                          </span>
                          <span className="rounded-full border border-hofo-walnut/12 bg-white px-2.5 py-1 text-[11px] font-medium text-hofo-walnut/72">
                            <Boxes className="mr-1 inline h-3 w-3" />
                            {Array.isArray(product.images) ? product.images.length : 0} images
                          </span>
                          <span className="rounded-full border border-hofo-walnut/12 bg-white px-2.5 py-1 text-[11px] font-medium text-hofo-walnut/72">
                            <BarChart3 className="mr-1 inline h-3 w-3" />
                            {specsCount} specs | {faqCount} FAQs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(product)}
                          className="inline-flex h-10 items-center gap-1 rounded-full border border-hofo-walnut/15 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(product)}
                          className="inline-flex h-10 items-center gap-1 rounded-full border border-hofo-walnut/15 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Clone
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingProductId === product.id}
                          className="inline-flex h-10 items-center gap-1 rounded-full border border-red-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingProductId === product.id ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-shell mt-10">
        <div className="rounded-3xl border border-hofo-walnut/10 bg-white/82 p-5 shadow-[0_16px_34px_rgba(30,18,10,0.08)] md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">Recent Orders</p>
              <h2 className="mt-2 font-serif text-3xl leading-none text-hofo-walnut-dark md:text-4xl">
                Customer Checkout Feed
              </h2>
              <p className="mt-3 text-sm text-hofo-walnut/72">
                Orders placed from checkout appear here automatically.
              </p>
            </div>

            <span className="inline-flex h-10 items-center rounded-full border border-hofo-walnut/12 bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-hofo-walnut/65">
              {orders.length} Order{orders.length === 1 ? "" : "s"}
            </span>
          </div>

          {loadingOrders ? (
            <div className="mt-5 rounded-2xl border border-hofo-walnut/10 bg-white/80 p-7 text-center text-sm text-hofo-walnut/70">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-hofo-walnut/10 bg-white/80 p-7 text-center text-sm text-hofo-walnut/70">
              No orders yet. Place a test order from checkout to verify the flow.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {orders.slice(0, 30).map((order) => {
                const customer = order?.customer || {};
                const items = Array.isArray(order?.items) ? order.items : [];
                const total = Number(order?.pricing?.total || 0);
                const subtotal = Number(order?.pricing?.subtotal || 0);
                const shipping = Number(order?.pricing?.shipping || 0);
                const itemCount = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
                const itemSummary = items
                  .map((item) => `${item?.name || "Item"} x${Number(item?.quantity || 0)}`)
                  .join(", ");
                const status = String(order?.status || "placed").toLowerCase();
                const statusClass = {
                  placed: "border-amber-200 bg-amber-50 text-amber-800",
                  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
                  shipped: "border-indigo-200 bg-indigo-50 text-indigo-800",
                  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
                  cancelled: "border-red-200 bg-red-50 text-red-700"
                };

                const address = [
                  customer?.addressLine1,
                  customer?.addressLine2,
                  customer?.city,
                  customer?.state,
                  customer?.postalCode
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={order?.id || order?.orderNumber || `${order?.createdAt}-${customer?.phone}`}
                    className="rounded-2xl border border-hofo-walnut/10 bg-white p-4 shadow-[0_10px_24px_rgba(30,18,10,0.06)] md:p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/58">
                          {formatDateTime(order?.createdAt)}
                        </p>
                        <h3 className="mt-1 font-serif text-2xl leading-none text-hofo-walnut-dark">
                          {order?.orderNumber || "Order"}
                        </h3>
                        <p className="mt-2 text-sm text-hofo-walnut/72">
                          {customer?.name || "Customer"} | {customer?.phone || "Phone unavailable"}
                        </p>
                        <p className="mt-1 text-sm text-hofo-walnut/68">{customer?.email || "Email unavailable"}</p>
                        <p className="mt-1 text-sm text-hofo-walnut/68">{address || "Address unavailable"}</p>
                      </div>

                      <div className="space-y-2 text-left lg:text-right">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                            statusClass[status] || "border-hofo-walnut/15 bg-white text-hofo-walnut-dark"
                          )}
                        >
                          {status}
                        </span>
                        <p className="text-sm font-semibold text-hofo-walnut-dark">
                          {itemCount} Item{itemCount === 1 ? "" : "s"}
                        </p>
                        <p className="text-sm text-hofo-walnut/72">Subtotal: Rs.{subtotal.toLocaleString("en-IN")}</p>
                        <p className="text-sm text-hofo-walnut/72">
                          Shipping: {shipping === 0 ? "Free" : `Rs.${shipping.toLocaleString("en-IN")}`}
                        </p>
                        <p className="text-base font-semibold text-hofo-walnut-dark">Total: Rs.{total.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="my-3 soft-divider" />

                    <p className="text-sm text-hofo-walnut/72">{itemSummary || "No items available for this order."}</p>
                    {order?.notes && (
                      <p className="mt-2 text-sm text-hofo-walnut/72">
                        <span className="font-semibold text-hofo-walnut-dark">Note:</span> {order.notes}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
