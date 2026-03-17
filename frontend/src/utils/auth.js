export function getStoredToken() {
  const token = localStorage.getItem('token');
  return typeof token === 'string' && token.trim() ? token : null;
}

export function getStoredUser() {
  const userRaw = localStorage.getItem('usuario');
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    return typeof user === 'object' && user !== null ? user : null;
  } catch (error) {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function getUserIdFromToken(token) {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    const payloadBase64 = payloadBase64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadBase64Url.length / 4) * 4, '=');

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    return payload?.id || null;
  } catch (error) {
    return null;
  }
}