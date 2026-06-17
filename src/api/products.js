const API_BASE = 'https://eloquent.koderspedia.online';

function formatPrice(price) {
  if (!price || typeof price.value !== 'number') {
    return null;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD',
    }).format(price.value);
  } catch {
    return `${price.value} ${price.currency || ''}`.trim();
  }
}

function mapVariant(variant) {
  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.attributes?.size?.name || variant.attributes?.description || variant.name,
    color: variant.attributes?.color?.name || '',
    price: variant.unitPrice?.value ?? null,
    currency: variant.unitPrice?.currency || 'USD',
    priceLabel: formatPrice(variant.unitPrice),
  };
}

function mapProduct(product) {
  const variants = (Array.isArray(product.variants) ? product.variants : []).map(mapVariant);
  const prices = variants
    .map((variant) => variant.price)
    .filter((value) => typeof value === 'number');

  const lowestValue = prices.length ? Math.min(...prices) : null;
  const currency = variants[0]?.currency || 'USD';
  const lowestPrice =
    lowestValue === null ? null : formatPrice({ value: lowestValue, currency });

  const thumbnail = product.thumbnailImage || {};

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    image: thumbnail.transformedUrl || thumbnail.url || '',
    price: lowestPrice,
    variants,
  };
}

export async function fetchProducts(signal) {
  const response = await fetch(`${API_BASE}/api/my-fourthwall-products`, { signal });

  if (!response.ok) {
    throw new Error(`Products request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The products response is invalid');
  }

  return data.data.map(mapProduct);
}
