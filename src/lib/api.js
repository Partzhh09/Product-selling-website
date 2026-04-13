import { fallbackProducts, normalizeProduct } from "@/lib/defaultProducts";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ADMIN_TOKEN_STORAGE_KEY = "hofo_admin_token";

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  const responseText = await response.text();
  let payload = {};

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

export function setStoredAdminToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAdminToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function getFallbackProducts(searchTerm = "") {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const list = normalizedSearch
    ? fallbackProducts.filter((product) =>
        [product.name, product.desc, product.category, product.wood, product.story]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : fallbackProducts;

  return list.map((product, index) => normalizeProduct(product, `fallback-${index + 1}`));
}

export function getFallbackProductById(id) {
  const match = fallbackProducts.find((product) => product.id === String(id));
  return normalizeProduct(match || fallbackProducts[0], String(id || "fallback-1"));
}

export async function getProducts(searchTerm = "") {
  const query = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
  const data = await request(`/api/products${query}`, { method: "GET" });

  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((item, index) => normalizeProduct(item, `api-${index + 1}`));
}

export async function getProductById(id) {
  const data = await request(`/api/products/${encodeURIComponent(String(id))}`, {
    method: "GET"
  });

  return normalizeProduct(data?.item, String(id));
}

export async function adminLogin(secret) {
  const data = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ secret })
  });

  return String(data?.token || "");
}

function getAdminHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function createAdminProduct(productData, token) {
  const data = await request("/api/admin/products", {
    method: "POST",
    headers: getAdminHeaders(token),
    body: JSON.stringify(productData)
  });

  return normalizeProduct(data?.item, "created-item");
}

export async function updateAdminProduct(id, productData, token) {
  const data = await request(`/api/admin/products/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: getAdminHeaders(token),
    body: JSON.stringify(productData)
  });

  return normalizeProduct(data?.item, String(id));
}

export async function deleteAdminProduct(id, token) {
  await request(`/api/admin/products/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: getAdminHeaders(token)
  });

  return true;
}
