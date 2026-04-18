const DEFAULT_API_BASE_URL = 'http://localhost:3000';

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

async function request(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || 'No fue posible completar la solicitud.');
  }

  return body;
}

export function fetchBackendInfo() {
  return request('/');
}

export function fetchHealth() {
  return request('/api/health');
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function recoverPassword(payload) {
  return request('/api/auth/recover-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchUsers() {
  return request('/api/users');
}

export function createUser(payload) {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateUser(id, payload) {
  return request(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteUser(id) {
  return request(`/api/users/${id}`, {
    method: 'DELETE'
  });
}
