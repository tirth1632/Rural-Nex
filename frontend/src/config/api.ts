import { Capacitor } from '@capacitor/core';

/**
 * Detects whether we're running inside a Capacitor native shell (Android/iOS)
 * or in a standard web browser.
 *
 * - Web browser: uses relative URLs (e.g., `/api/v1/...`) which Vite proxy handles
 * - Native app:  uses the full backend URL since there's no Vite proxy
 */
const isNative = Capacitor.isNativePlatform();

/**
 * Set your deployed backend URL here.
 * For local testing on same WiFi, use your machine's local IP:
 *   e.g., 'http://192.168.1.100:8000'
 *
 * For production, use your deployed server URL:
 *   e.g., 'https://api.ruralnex.com'
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.100:8000';

/**
 * API_BASE_URL:
 * - On web: '' (empty string, relative URLs handled by Vite proxy)
 * - On native: full backend URL (e.g., 'http://192.168.1.100:8000')
 */
export const API_BASE_URL = isNative ? BACKEND_URL : '';

/**
 * Helper to build a full API URL.
 * Usage: apiUrl('/api/v1/users/login/')
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export { isNative };
