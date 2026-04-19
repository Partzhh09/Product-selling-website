import mongoose from "mongoose";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=2400&h=1600&auto=format&fit=crop";

const faqSchema = new mongoose.Schema(
  {
    q: { type: String, required: true, trim: true },
    a: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desc: { type: String, default: "", trim: true },
    category: { type: String, default: "Kitchenware", trim: true },
    wood: { type: String, default: "Teak", trim: true },
    story: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    images: { type: [String], default: [DEFAULT_IMAGE] },
    variants: {
      size: { type: [String], default: ["Standard"] },
      finish: { type: [String], default: ["Natural Oil"] }
    },
    specs: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    faqs: { type: [faqSchema], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

productSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    const safePrice = Number(ret.price) || 0;
    const safeMrp = Number(ret.mrp) || safePrice;
    const computedDiscount =
      safeMrp > 0 ? Math.max(0, Math.round(((safeMrp - safePrice) / safeMrp) * 100)) : 0;

    const images = Array.isArray(ret.images)
      ? ret.images.filter((image) => typeof image === "string" && image.trim())
      : [];

    const size = Array.isArray(ret.variants?.size)
      ? ret.variants.size.filter((entry) => typeof entry === "string" && entry.trim())
      : [];

    const finish = Array.isArray(ret.variants?.finish)
      ? ret.variants.finish.filter((entry) => typeof entry === "string" && entry.trim())
      : [];

    ret.id = String(ret._id);
    ret.images = images.length > 0 ? images : [DEFAULT_IMAGE];
    ret.variants = {
      size: size.length > 0 ? size : ["Standard"],
      finish: finish.length > 0 ? finish : ["Natural Oil"]
    };

    if (!ret.specs || typeof ret.specs !== "object" || Array.isArray(ret.specs)) {
      ret.specs = {};
    }

    ret.faqs = Array.isArray(ret.faqs)
      ? ret.faqs.filter((faq) => faq && faq.q && faq.a)
      : [];

    const discountValue = Number(ret.discount);
    ret.discount = Number.isFinite(discountValue) ? Math.max(0, discountValue) : computedDiscount;

    delete ret._id;
    return ret;
  }
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
