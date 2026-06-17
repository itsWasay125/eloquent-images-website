const API_BASE = 'https://eloquent.koderspedia.online';

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request to ${path} failed`);
  }

  return data;
}

export function loginRequest({ email, password }) {
  return postJson('/api/login', { email, password });
}

export function registerRequest({ name, email, password }) {
  return postJson('/api/register', { name, email, password });
}
