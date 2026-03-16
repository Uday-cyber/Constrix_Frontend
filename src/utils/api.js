const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const normalizeApiUrl = (value = "") => {
    let url = String(value).trim().replace(/\/+$/, "");
    // Common Railway typo: "...up.railway" instead of "...up.railway.app"
    if (url.includes(".up.railway") && !url.includes(".up.railway.app")) {
        url = url.replace(".up.railway", ".up.railway.app");
    }
    return url;
};

const normalizedApiUrl = normalizeApiUrl(rawApiUrl);

export const BACKEND_BASE_URL = normalizedApiUrl;
export const API_BASE_URL = `${normalizedApiUrl}/api/users`;
export const WORKSPACE_API_BASE = `${normalizedApiUrl}/api/workspaces`;
