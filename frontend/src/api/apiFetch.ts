import { API_BASE_URL } from '../config/api';

/**
 * A drop-in replacement for the native `fetch()` that automatically
 * prepends API_BASE_URL when running inside Capacitor native shell.
 *
 * On web: fetch('/api/v1/...') → '/api/v1/...' (Vite proxy handles it)
 * On native: fetch('/api/v1/...') → 'http://BACKEND_IP:8000/api/v1/...'
 *
 * Usage: Replace `fetch(` with `apiFetch(` in your API calls.
 */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string' && input.startsWith('/')) {
    input = `${API_BASE_URL}${input}`;
  }
  return fetch(input, init);
}
