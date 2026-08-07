const API_BASE = 'https://api.eloquent-image.com';

let categoriesCache = null;
let categoriesRequest = null;

function getImageName(image) {
  return (
    image.title ||
    image.originalName ||
    image.fileName ||
    image.filename ||
    'Original name unavailable'
  );
}

// Clean up titles from raw file imports: drop trailing "(1)"-style numbers,
// turn hyphens/underscores into spaces, and collapse extra whitespace.
function cleanCaption(name = '') {
  return name
    .replace(/\.[a-z0-9]{2,4}$/i, '') // strip a leftover file extension
    .replace(/\s*\(\s*\d+\s*\)/g, '') // remove "(1)", "( 2 )" etc.
    .replace(/[-_]+/g, ' ') // hyphens/underscores -> spaces
    .replace(/\s+\d+\s*$/, '') // drop a trailing number like "American Robin 4"
    .replace(/\s+/g, ' ') // collapse repeated spaces
    .trim();
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { cache: 'no-store', signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function mapApiImages(images = []) {
  return images
    .filter((image) => image.imageUrl)
    .map((image) => ({
      id: image.id,
      src: image.imageUrl,
      caption: cleanCaption(getImageName(image)),
      categories: image.categories || [],
      type: 'image',
      // Kept so callers can sort a merged, cross-category feed newest-first.
      createdAt: image.createdAt || image.created_at || null,
    }));
}

function getImageSortOrder(image, categoryId) {
  const category = (image.categories || []).find(
    (cat) => String(cat.id ?? cat.categoryId) === String(categoryId),
  );
  const sortOrder = Number(category?.sortOrder);
  return Number.isFinite(sortOrder) && sortOrder > 0 ? sortOrder : null;
}

function sortByCaption(images = []) {
  return [...images].sort((first, second) =>
    (first.caption || '').localeCompare(second.caption || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

function sortImagesForCategory(images = [], categoryId) {
  const hasSortOrder = images.some((image) => getImageSortOrder(image, categoryId) !== null);
  if (categoryId && !hasSortOrder) return [...images];

  return [...images].sort((first, second) => {
    const firstOrder = getImageSortOrder(first, categoryId);
    const secondOrder = getImageSortOrder(second, categoryId);

    if (firstOrder !== null && secondOrder !== null && firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }
    if (firstOrder !== null || secondOrder !== null) return firstOrder !== null ? -1 : 1;

    return sortByCaption([first, second])[0] === first ? -1 : 1;
  });
}

function hasIsNewFlag(image) {
  return (
    Object.prototype.hasOwnProperty.call(image, 'isNew') ||
    Object.prototype.hasOwnProperty.call(image, 'is_new')
  );
}

function isMarkedNew(image) {
  return (
    image.isNew === true ||
    image.is_new === true ||
    String(image.isNew).toLowerCase() === 'true' ||
    String(image.is_new).toLowerCase() === 'true'
  );
}

function getWhatsNewSortDate(image) {
  return (
    image.isNewAt ||
    image.is_new_at ||
    image.isNewUpdatedAt ||
    image.is_new_updated_at ||
    image.updatedAt ||
    image.updated_at ||
    image.createdAt ||
    image.created_at ||
    null
  );
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

// Fetch the latest N images across all categories that are marked as "What's New"
export async function fetchLatestImages(limit = 15, signal) {
  const params = new URLSearchParams({ limit: '100', is_new: 'true' });
  const data = await fetchJson(`${API_BASE}/api/images?${params.toString()}`, signal);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The images response is invalid');
  }

  let newImages = data.data;

  // The backend filters by is_new but does not always echo isNew in the list
  // response. Only apply the local fallback when the flag is actually present.
  if (newImages.some(hasIsNewFlag)) {
    newImages = newImages.filter(isMarkedNew);
  }

  newImages = [...newImages].sort(
    (a, b) => new Date(getWhatsNewSortDate(b) || 0) - new Date(getWhatsNewSortDate(a) || 0),
  );

  return mapApiImages(newImages.slice(0, limit));
}

// Every image in a category (walks all pages) — used by the product detail
// design picker so the chosen category shows its full set, not just page 1.
export async function fetchAllCategoryImages(categoryId, signal) {
  const first = await fetchCategoryImagesPage(categoryId, 1, signal, 100);
  const totalPages = first.meta?.totalPages ?? 1;
  if (totalPages <= 1) return sortImagesForCategory(first.images, categoryId);

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchCategoryImagesPage(categoryId, index + 2, signal, 100).catch(() => null),
    ),
  );

  const seen = new Set(first.images.map((image) => image.src));
  const more = rest
    .flatMap((page) => (page ? page.images : []))
    .filter((image) => !seen.has(image.src));

  return sortImagesForCategory(first.images.concat(more), categoryId);
}

export async function fetchCategoryImagesPage(categoryId, page = 1, signal, limit = 100) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy: categoryId ? 'sortOrder' : 'title',
    order: 'asc',
    _: String(Date.now()),
  });
  if (categoryId) params.set('categoryId', categoryId);

  const data = await fetchJson(`${API_BASE}/api/images?${params.toString()}`, signal);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The images response is invalid');
  }

  return {
    images: mapApiImages(data.data),
    meta: {
      currentPage: data.meta?.currentPage ?? page,
      totalItems: data.meta?.totalItems ?? data.data.length,
      totalPages: data.meta?.totalPages ?? 1,
    },
  };
}
