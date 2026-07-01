const API_BASE = 'https://eloquent.koderspedia.online';

let categoriesCache = null;
let categoriesRequest = null;
const imagePageCache = new Map();

function getImageName(image) {
  return (
    image.originalName ||
    image.fileName ||
    image.filename ||
    image.title ||
    'Original name unavailable'
  );
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function mapApiImages(images = []) {
  return images
    .filter((image) => image.imageUrl)
    .map((image) => ({
      src: image.imageUrl,
      caption: getImageName(image),
      type: 'image',
    }));
}

export async function fetchGalleryCategories() {
  if (categoriesCache) return categoriesCache;
  if (categoriesRequest) return categoriesRequest;

  categoriesRequest = fetchJson(`${API_BASE}/api/Categories`)
    .then((data) => {
      if (!data.success || !Array.isArray(data.categories)) {
        throw new Error('The categories response is invalid');
      }

      categoriesCache = data.categories;
      return categoriesCache;
    })
    .finally(() => {
      categoriesRequest = null;
    });

  return categoriesRequest;
}

export async function searchImages(query, signal) {
  const params = new URLSearchParams({ limit: '100', search: query });

  const data = await fetchJson(`${API_BASE}/api/images?${params.toString()}`, signal);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The search response is invalid');
  }

  return mapApiImages(data.data);
}

// Flat list of gallery designs for the product "place your design" picker.
// Uses a high limit so the user sees their available designs in one grid.
export async function fetchGalleryImages(signal) {
  const data = await fetchJson(`${API_BASE}/api/images?limit=100`, signal);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The images response is invalid');
  }

  return mapApiImages(data.data);
}

// Every image in a category (walks all pages) — used by the product detail
// design picker so the chosen category shows its full set, not just page 1.
export async function fetchAllCategoryImages(categoryId, signal) {
  const first = await fetchCategoryImagesPage(categoryId, 1, signal);
  const totalPages = first.meta?.totalPages ?? 1;
  if (totalPages <= 1) return first.images;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchCategoryImagesPage(categoryId, index + 2, signal).catch(() => null),
    ),
  );

  const seen = new Set(first.images.map((image) => image.src));
  const more = rest
    .flatMap((page) => (page ? page.images : []))
    .filter((image) => !seen.has(image.src));

  return first.images.concat(more);
}

export async function fetchCategoryImagesPage(categoryId, page = 1, signal) {
  const key = `${categoryId}:${page}`;
  if (imagePageCache.has(key)) return imagePageCache.get(key);

  const params = new URLSearchParams({ page: String(page) });
  if (categoryId) params.set('categoryId', categoryId);

  const data = await fetchJson(`${API_BASE}/api/images?${params.toString()}`, signal);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The images response is invalid');
  }

  const result = {
    images: mapApiImages(data.data),
    meta: {
      currentPage: data.meta?.currentPage ?? page,
      totalItems: data.meta?.totalItems ?? data.data.length,
      totalPages: data.meta?.totalPages ?? 1,
    },
  };

  imagePageCache.set(key, result);
  return result;
}
