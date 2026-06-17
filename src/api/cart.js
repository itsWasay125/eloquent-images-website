import { getToken } from './authToken.js';

const API_BASE = 'https://eloquent.koderspedia.online';

async function request(path, { method = 'POST', body, signal } = {}) {
  const token = getToken();
  const headers = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // No `credentials: 'include'` here: auth is via the Bearer token, and the API
  // responds with `Access-Control-Allow-Origin: *`, which the browser rejects
  // for credentialed requests.
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : { success: true };

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Cart request ${path} failed`);
  }

  return data;
}

// The cart object can be nested differently per endpoint:
//   my-cart:          { data: { cart: { items } } }
//   remove / clear:   { cart: { cart: { items } } }
//   change-quantity:  { cart: { items } }
//   add:              { cart: { ...no items... } }  -> needs a fresh fetch
// This walks the payload to find the node that actually holds `items`.
function findCartNode(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 6) {
    return null;
  }
  if (Array.isArray(node.items)) {
    return node;
  }
  return findCartNode(node.cart, depth + 1) || findCartNode(node.data, depth + 1);
}

function mapCartItem(item = {}) {
  const variant = item.variant || {};
  const price = variant.unitPrice || {};
  const image = variant.images?.[0] || {};

  return {
    id: variant.id,
    variantId: variant.id,
    name: variant.product?.name || variant.name || 'Product',
    size: variant.attributes?.size?.name || '',
    image: image.transformedUrl || image.url || '',
    quantity: item.quantity ?? 1,
    price: price.value ?? null,
    currency: price.currency || 'USD',
  };
}

// Returns a normalized cart, or null when the payload carries no items node
// (e.g. the add endpoint), so callers know to re-fetch the authoritative cart.
export function normalizeCart(payload) {
  const cart = findCartNode(payload);
  if (!cart) {
    return null;
  }

  const items = (cart.items || []).map(mapCartItem);

  return {
    id: cart.id || null,
    items,
    count: items.reduce((total, item) => total + (item.quantity || 0), 0),
    subtotal: items.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0,
    ),
    currency: items[0]?.currency || 'USD',
  };
}

export async function fetchCart(signal) {
  const data = await request('/api/cart/my-cart', { method: 'GET', signal });
  return normalizeCart(data) || EMPTY_CART;
}

const EMPTY_CART = { id: null, items: [], count: 0, subtotal: 0, currency: 'USD' };

// Runs a mutating request and returns the resulting cart. If the response did
// not include the items list, fall back to a fresh my-cart fetch.
async function mutateCart(path, body) {
  const data = await request(path, { body });
  return normalizeCart(data) || fetchCart();
}

export function addToCart({ variantId, quantity = 1 }) {
  return mutateCart('/api/cart/add', { items: [{ variantId, quantity }] });
}

export function changeCartQuantity({ variantId, quantity }) {
  return mutateCart('/api/change-cart-quantity', {
    items: [{ variantId, quantity }],
  });
}

export function removeCartItem({ variantId }) {
  return mutateCart('/api/cart/remove-item', { items: [{ variantId }] });
}

export function clearCart() {
  return mutateCart('/api/cart/clear', {});
}

export async function checkoutCart(address) {
  // address: { name, address1, city, state_code, country_code, zip }
  return request('/api/cart/checkout', { body: address });
}
