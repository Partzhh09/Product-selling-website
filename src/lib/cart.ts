export const CART_STORAGE_KEY = "hofo_cart_v1";
export const CART_UPDATED_EVENT = "hofo-cart-updated";

export type CartItemInput = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function emitCartUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function readCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [] as CartItem[];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [] as CartItem[];
    }

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const item = entry as {
          id?: unknown;
          name?: unknown;
          price?: unknown;
          image?: unknown;
          quantity?: unknown;
        };

        const id = typeof item.id === "string" ? item.id.trim() : String(item.id ?? "").trim();
        const price = Number(item.price);
        const name = typeof item.name === "string" ? item.name : "";
        const image = typeof item.image === "string" ? item.image : "";
        const quantity = clampQuantity(Number(item.quantity));

        if (!id || !Number.isFinite(price) || !name || !image) {
          return null;
        }

        return {
          id,
          name,
          price,
          image,
          quantity,
        } as CartItem;
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [] as CartItem[];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartUpdated();
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(input: CartItemInput) {
  const items = readCart();
  const quantity = clampQuantity(Number(input.quantity ?? 1));
  const found = items.find((item) => item.id === input.id);

  let next: CartItem[];

  if (found) {
    next = items.map((item) =>
      item.id === input.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    next = [
      ...items,
      {
        id: input.id,
        name: input.name,
        price: input.price,
        image: input.image,
        quantity,
      },
    ];
  }

  writeCart(next);
  return next;
}

export function updateCartQuantity(id: string, quantity: number) {
  const items = readCart();

  if (quantity <= 0) {
    const next = items.filter((item) => item.id !== id);
    writeCart(next);
    return next;
  }

  const nextQuantity = clampQuantity(quantity);
  const next = items.map((item) =>
    item.id === id ? { ...item, quantity: nextQuantity } : item
  );

  writeCart(next);
  return next;
}

export function removeFromCart(id: string) {
  const next = readCart().filter((item) => item.id !== id);
  writeCart(next);
  return next;
}

export function clearCart() {
  writeCart([]);
  return [] as CartItem[];
}
