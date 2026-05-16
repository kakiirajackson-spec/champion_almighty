const BASE_URL = import.meta.env.VITE_API_URL || 'https://champion-almighty.onrender.com';
export const API = `${BASE_URL}/api`;
export const BACKEND_URL = BASE_URL;
export const SOCKET_URL = import.meta.env.VITE_WS_URL || BASE_URL;
