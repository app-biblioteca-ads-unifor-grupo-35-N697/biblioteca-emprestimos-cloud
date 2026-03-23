const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function buildUrl(path) {
  if (!path.startsWith("/")) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const isObjectData = typeof data === "object" && data !== null;
    const message = isObjectData
      ? data.error || data.message || "Erro ao processar a requisicao"
      : "Erro ao processar a requisicao";
    
    const error = new Error(message);
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

export { API_BASE_URL };
