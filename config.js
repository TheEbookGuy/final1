// Urban Mining Connect backend configuration
// Paste your Render backend URL below.

const API_BASE_URL = "https://final1-2.onrender.com/";

async function api(path, options = {}) {
  const response = await fetch(
    API_BASE_URL.replace(/\/$/, "") + "/api" + path,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Request failed");
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
