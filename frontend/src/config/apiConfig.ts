/**
 * Centralized API configuration for the LMS.
 * This ensures the frontend can dynamically resolve the backend URL
 * based on the current browser host or environment variables.
 */

const host = import.meta.env.VITE_API_HOST || window.location.hostname;
const port = import.meta.env.VITE_API_PORT || '3000';

// Priority: Explicit VITE_API_URL > Calculated dynamic URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${host}:${port}/api`;
