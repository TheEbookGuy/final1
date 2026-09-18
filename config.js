const API_BASE_URL = "https://final1-3.onrender.com";

async function api(path, options = {}) {
  const url =
    API_BASE_URL.replace(/\/$/, "") +
    "/api" +
    (path.startsWith("/") ? path : "/" + path);

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
