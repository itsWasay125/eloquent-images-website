export const IMAGE_CATEGORIES = [
  { label: 'Gallery', navPath: '/gallery/#gallery', slug: 'gallery' },
  { label: 'Birds', navPath: '/gallery/#birds', slug: 'birds' },
  { label: 'Mammals', navPath: '/gallery/#mammals', slug: 'mammals' },
  { label: 'Insects & Spiders', navPath: '/gallery/#insects-spiders', slug: 'insects-spiders' },
  { label: 'Reptiles & Amphibians', navPath: '/gallery/#reptiles-amphibians', slug: 'reptiles-amphibians' },
  { label: 'Flora', navPath: '/gallery/#flora', slug: 'flora' },
  { label: 'Landscapes', navPath: '/gallery/#landscapes', slug: 'landscapes' },
  { label: 'Miscellaneous', navPath: '/gallery/#miscellaneous', slug: 'miscellaneous' },
];

const CATEGORY_ORDER = new Map(
  IMAGE_CATEGORIES.map((category, index) => [category.slug, index]),
);

function slugifyCategory(value = '') {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryOrder(category) {
  const slug = category.slug || slugifyCategory(category.name || category.label);
  return CATEGORY_ORDER.has(slug) ? CATEGORY_ORDER.get(slug) : IMAGE_CATEGORIES.length;
}

export function sortGalleryCategories(categories = []) {
  return [...categories].sort((first, second) => {
    const orderDiff = getCategoryOrder(first) - getCategoryOrder(second);
    if (orderDiff !== 0) return orderDiff;
    return (first.name || first.label || '').localeCompare(second.name || second.label || '');
  });
}
