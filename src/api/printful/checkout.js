// =============================================================================
// PRINTFUL FOLDER — "stripe-checkout"
// -----------------------------------------------------------------------------
// The Buy Now flow. There is NO cart: the user picks a catalog variant + a
// gallery design image + a shipping address, and we POST it straight to
// /api/printful-checkout. The backend creates a Printful draft order, gets live
// shipping/tax, and opens a Stripe checkout session — we just redirect to it.
//
// Endpoints handled here (base = {{baseurl}}):
//   - POST /api/printful-checkout  -> create Stripe session, returns checkoutUrl
//   - GET  /api/my-orders          -> the logged-in user's order history
// =============================================================================

import { getToken } from '../authToken.js';

const API_BASE = 'https://eloquent.koderspedia.online';

// -----------------------------------------------------------------------------
// POST /api/printful-checkout
//   payload: { recipient, items: [{ variant_id, quantity, retail_price, files }] }
//   - recipient: shipping address + contact (name/email/address1/city/state_code/zip/country_code/phone)
//   - items[].variant_id: Printful catalog variant id (from the product detail)
//   - items[].files[].url: the chosen gallery design's S3 image URL
// Returns: { checkoutUrl, sessionId, order }
// -----------------------------------------------------------------------------
export async function createPrintfulCheckout({ recipient, items }) {
  const token = getToken();

  const response = await fetch(`${API_BASE}/api/printful-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ recipient, items }),
  });

  const data = await response.json().catch(() => ({ success: false }));
  console.log('[Printful][checkout] POST /printful-checkout ->', data);

  if (!response.ok || data.success === false) {
    // Printful's specific validation reason lives in error.result (e.g.
    // "Recipient: Invalid state code"). Prefer it over the generic message.
    const detail =
      data?.error?.result || data?.result || data?.message || 'Checkout could not be started';
    throw new Error(detail);
  }

  return data; // { success, sessionId, checkoutUrl, order }
}

// -----------------------------------------------------------------------------
// GET /api/my-orders  ->  logged-in user's orders (history page)
// -----------------------------------------------------------------------------
export async function fetchMyOrders(signal) {
  const token = getToken();

  const response = await fetch(`${API_BASE}/api/my-orders`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const data = await response.json().catch(() => ({ success: false }));
  console.log('[Printful][checkout] GET /my-orders ->', data);

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Could not load your orders');
  }

  // Backend may nest the list under data / orders — normalize to an array.
  const orders = Array.isArray(data) ? data : data.data || data.orders || [];
  return orders;
}
