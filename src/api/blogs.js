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

// Lightweight mapping for the blog LIST — no full-content sanitization
// (that per-element work is only needed on the detail page).
function mapBlogSummary(blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: makeExcerpt(blog.content),
    featuredImage: blog.featuredImage,
    status: blog.status,
    createdAt: blog.createdAt,
    author: blog.author,
    category: blog.category,
  };
}

// Full mapping for the blog DETAIL page (sanitized HTML content + images).
function mapBlogFull(blog) {
  return {
    ...mapBlogSummary(blog),
    content: sanitizeContent(blog.content),
    images: Array.isArray(blog.images) ? blog.images : [],
  };
}

async function fetchBlogsRaw(signal) {
  const response = await fetch(`${API_BASE}/api/Blogs`, { signal });

  if (!response.ok) {
    throw new Error(`Blogs request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('The blogs response is invalid');
  }

  return data.data.filter((blog) => blog.status === 'ACTIVE');
}

export async function fetchBlogs(signal) {
  const blogs = await fetchBlogsRaw(signal);
  return blogs.map(mapBlogSummary);
}

export async function fetchBlogBySlug(slug, signal) {
  const blogs = await fetchBlogsRaw(signal);
  const blog = blogs.find((item) => item.slug === slug);
  return blog ? mapBlogFull(blog) : null;
}
