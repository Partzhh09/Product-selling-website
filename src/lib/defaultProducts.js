export const premiumWoodenImage = "/wooden-product.png";

const defaultSpecs = {
  Material: "Solid Teak Wood",
  Dimensions: "16 x 12 x 1.5 inches",
  Weight: "2.4 kg",
  Finish: "Food-safe Mineral Oil"
};

const defaultFaqs = [
  {
    q: "Is this product food-safe?",
    a: "Yes. We use food-safe oils and hand-polishing methods for all kitchen products."
  },
  {
    q: "How do I clean and maintain it?",
    a: "Clean with a damp cloth and re-oil with food-grade mineral oil every few weeks."
  }
];

export const fallbackProducts = [
  {
    id: "fallback-1",
    name: "Artisan Teak Chopping Board",
    desc: "End-grain teak board for daily prep and serving.",
    category: "Kitchenware",
    wood: "Teak",
    story: "Hand-finished by skilled artisans in Rajasthan.",
    price: 1899,
    mrp: 2499,
    discount: 24,
    images: [
      premiumWoodenImage,
      "https://images.unsplash.com/photo-1593006526979-4f8f5c6dd6b1?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=2000&auto=format&fit=crop"
    ],
    variants: {
      size: ['Small (12x8")', 'Medium (16x12")', 'Large (20x15")'],
      finish: ["Natural Oil", "Dark Walnut Stain"]
    },
    specs: {
      Material: "100% Solid Teak Wood",
      Dimensions: "16 x 12 x 1.5 inches",
      Weight: "2.4 kg",
      Finish: "Food-safe Mineral Oil & Beeswax",
      Color: "Natural Teak Brown",
      Brand: "HOFO Manufacturing"
    },
    faqs: defaultFaqs
  },
  {
    id: "fallback-2",
    name: "Hand-Carved Serving Bowl",
    desc: "Wide carved bowl suited for salads and center table presentation.",
    category: "Decor",
    wood: "Mango",
    story: "Three-step carved finish with natural oil treatment.",
    price: 2299,
    mrp: 2899,
    discount: 21,
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=2000&auto=format&fit=crop"
    ],
    variants: {
      size: ["Standard", "Large"],
      finish: ["Natural", "Smoked"]
    },
    specs: defaultSpecs,
    faqs: defaultFaqs
  },
  {
    id: "fallback-3",
    name: "Minimalist Wooden Spoons Set",
    desc: "Set of four smooth spoons designed for non-stick cookware.",
    category: "Kitchenware",
    wood: "Sheesham",
    story: "Balanced and hand-rounded for comfortable use.",
    price: 899,
    mrp: 1299,
    discount: 31,
    images: [
      "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop"
    ],
    variants: {
      size: ["Set of 4"],
      finish: ["Matte Oil"]
    },
    specs: defaultSpecs,
    faqs: defaultFaqs
  },
  {
    id: "fallback-4",
    name: "Walnut Wood Serving Tray",
    desc: "Premium serving tray with carved grips and rich grain lines.",
    category: "Gift Sets",
    wood: "Walnut",
    story: "Ideal for tea service, gifting, and premium table styling.",
    price: 3499,
    mrp: 4299,
    discount: 19,
    images: [
      "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2000&auto=format&fit=crop"
    ],
    variants: {
      size: ["Medium", "Large"],
      finish: ["Polished", "Natural"]
    },
    specs: defaultSpecs,
    faqs: defaultFaqs
  }
];

function toSafeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback;
  }

  const next = values
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  return next.length > 0 ? next : fallback;
}

function toSpecs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultSpecs;
  }

  const entries = Object.entries(value)
    .map(([key, val]) => [String(key).trim(), String(val ?? "").trim()])
    .filter(([key, val]) => key && val);

  return entries.length > 0 ? Object.fromEntries(entries) : defaultSpecs;
}

function toFaqs(value) {
  if (!Array.isArray(value)) {
    return defaultFaqs;
  }

  const faqs = value
    .map((faq) => ({
      q: typeof faq?.q === "string" ? faq.q.trim() : "",
      a: typeof faq?.a === "string" ? faq.a.trim() : ""
    }))
    .filter((faq) => faq.q && faq.a);

  return faqs.length > 0 ? faqs : defaultFaqs;
}

export function normalizeProduct(rawProduct, fallbackId = "fallback") {
  const fallback = fallbackProducts[0];
  const raw = rawProduct && typeof rawProduct === "object" ? rawProduct : {};

  const id = String(raw.id || raw._id || fallbackId);
  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : fallback.name;
  const desc = typeof raw.desc === "string" ? raw.desc.trim() : fallback.desc;
  const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim() : fallback.category;
  const wood = typeof raw.wood === "string" && raw.wood.trim() ? raw.wood.trim() : fallback.wood;
  const story = typeof raw.story === "string" ? raw.story.trim() : fallback.story;

  const price = Math.max(0, Math.round(toSafeNumber(raw.price, fallback.price)));
  const mrpCandidate = Math.max(0, Math.round(toSafeNumber(raw.mrp, fallback.mrp)));
  const mrp = mrpCandidate < price ? price : mrpCandidate;

  const incomingImages = Array.isArray(raw.images)
    ? raw.images
    : typeof raw.image === "string"
      ? [raw.image]
      : [];

  const images = toStringArray(incomingImages, fallback.images);

  const variants = {
    size: toStringArray(raw?.variants?.size, ["Standard"]),
    finish: toStringArray(raw?.variants?.finish, ["Natural Oil"])
  };

  const discountFromPrice = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const discount = Math.max(0, Math.round(toSafeNumber(raw.discount, discountFromPrice)));

  return {
    id,
    name,
    desc,
    category,
    wood,
    story,
    price,
    mrp,
    discount,
    images,
    variants,
    specs: toSpecs(raw.specs),
    faqs: toFaqs(raw.faqs)
  };
}
