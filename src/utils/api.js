const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");

export const API_BASE_URL = `${normalizedApiUrl}/api/users`;
