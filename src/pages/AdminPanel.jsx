import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  Save,
  Shield,
  Trash2,
  X
} from "lucide-react";
import {
  adminLogin,
  clearStoredAdminToken,
  createAdminProduct,
  deleteAdminProduct,
  getProducts,
  getStoredAdminToken,
  setStoredAdminToken,
  updateAdminProduct
} from "@/lib/api";

const emptyFormState = {
  name: "",
  desc: "",
  category: "Kitchenware",
  wood: "Teak",
  story: "",
  price: "",
  mrp: "",
  imageUrl: ""
};

function parseImages(rawImageText) {
  return rawImageText
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toPayload(form) {
  const price = Number(form.price);
  const mrp = Number(form.mrp);

  return {
    name: form.name.trim(),
    desc: form.desc.trim(),
    category: form.category.trim() || "Kitchenware",
    wood: form.wood.trim() || "Teak",
    story: form.story.trim(),
    price: Number.isFinite(price) ? price : 0,
    mrp: Number.isFinite(mrp) ? mrp : 0,
    images: parseImages(form.imageUrl)
  };
}

export function AdminPanel() {
  const [adminSecret, setAdminSecret] = useState("");
  const [token, setToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyFormState);

  const totalProducts = useMemo(() => products.length, [products]);

  const loadProducts = async () => {
    if (!token) {
      return;
    }

    setLoadingProducts(true);
    setErrorMessage("");

    try {
      const nextProducts = await getProducts();
      setProducts(nextProducts);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const savedToken = getStoredAdminToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!adminSecret.trim()) {
      setErrorMessage("Enter your admin secret to continue.");
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
    setForm(emptyFormState);
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
    setForm({
      name: product.name,
      desc: product.desc,
      category: product.category,
      wood: product.wood,
      story: product.story,
      price: String(product.price),
      mrp: String(product.mrp),
      imageUrl: (product.images || []).join("\n")
    });

    setStatusMessage(`Editing ${product.name}`);
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
      await loadProducts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (productId) => {
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
              Use your backend admin secret to manage products in MongoDB.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-hofo-walnut/65">
                  Admin Secret
                </span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-hofo-walnut/45" />
                  <input
                    value={adminSecret}
                    onChange={(event) => setAdminSecret(event.target.value)}
                    placeholder="Enter ADMIN_API_KEY"
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
                Product Control Room
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72 md:text-base">
                Create, update, and remove wooden products directly in MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-hofo-walnut/14 bg-white/70 px-4 py-2 text-sm font-semibold text-hofo-walnut-dark">
                {totalProducts} Products
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hofo-walnut/15 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-walnut-dark hover:border-hofo-teak/40 hover:text-hofo-teak"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 grid gap-8 lg:grid-cols-[400px_1fr]">
        <aside className="h-max rounded-3xl border border-hofo-walnut/10 bg-white/82 p-6 shadow-[0_18px_35px_rgba(30,18,10,0.1)] lg:sticky lg:top-28">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-walnut/58">
              {editingId ? "Edit Product" : "Add Product"}
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

            <div className="grid grid-cols-2 gap-3">
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

            <button
              type="submit"
              disabled={savingProduct}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-hofo-walnut-dark px-6 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-cream hover:bg-hofo-teak disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {savingProduct ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
          </form>

          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-hofo-teak hover:text-hofo-walnut-dark"
          >
            <Shield className="h-4 w-4" />
            View Storefront
          </Link>
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

          {loadingProducts ? (
            <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-hofo-walnut/10 bg-white/80 p-8 text-center text-sm text-hofo-walnut/70">
              No products found. Add your first product from the form.
            </div>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-hofo-walnut/10 bg-white/82 shadow-[0_14px_28px_rgba(28,16,8,0.08)]"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-24 w-full rounded-2xl object-cover sm:w-28"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/55">
                      {product.category} | {product.wood}
                    </p>
                    <h3 className="mt-1 truncate font-serif text-2xl text-hofo-walnut-dark">{product.name}</h3>
                    <p className="mt-1 text-sm text-hofo-walnut/70">
                      Rs.{product.price.toLocaleString("en-IN")} | MRP Rs.{product.mrp.toLocaleString("en-IN")}
                    </p>
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
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingProductId === product.id}
                      className="inline-flex h-10 items-center gap-1 rounded-full border border-red-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingProductId === product.id ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
