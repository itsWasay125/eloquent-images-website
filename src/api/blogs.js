const API_BASE = 'https://eloquent.koderspedia.online';

const BLOCKED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'link',
  'meta',
];

function parseHtml(html = '') {
  return new DOMParser().parseFromString(html, 'text/html');
}

function sanitizeContent(html) {
  const document = parseHtml(html);

  document.querySelectorAll(BLOCKED_TAGS.join(',')).forEach((node) => {
    node.remove();
  });

  document.body.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (
        name.startsWith('on') ||
        name === 'style' ||
        ((name === 'href' || name === 'src') &&
          (value.startsWith('javascript:') || value.startsWith('data:text/html')))
      ) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === 'IMG') {
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
    }
  });

  return document.body.innerHTML;
}

function makeExcerpt(html, maxLength = 160) {
  const text = parseHtml(html).body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function mapBlog(blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: sanitizeContent(blog.content),
    excerpt: makeExcerpt(blog.content),
    featuredImage: blog.featuredImage,
    status: blog.status,
    createdAt: blog.createdAt,
    author: blog.author,
    category: blog.category,
    images: Array.isArray(blog.images) ? blog.images : [],
  };
}

export async function fetchBlogs(signal) {
  const response = await fetch(`${API_BASE}/api/Blogs`, { signal });

  if (!response.ok) {
    throw new Error(`Blogs request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The blogs response is invalid');
  }

  return data.data
    .filter((blog) => blog.status === 'ACTIVE')
    .map(mapBlog);
}
