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
    
    // Logout automático em caso de sessão expirada (401)
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Redirecionar apenas se não estiver já em página de autenticação
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('cadastro')) {
        window.location.href = '/login';
      }
    }
    
    const error = new Error(message);
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

export { API_BASE_URL };
